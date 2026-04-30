import createClient from "openapi-fetch";

import type { components, paths } from "../generated/payments-api.js";
import { MirageError } from "./errors.js";

export const DEFAULT_PAYMENTS_API_BASE_URL = "https://payments.magicblock.app";

export type PaymentsTransferRequest = components["schemas"]["TransferRequest"];
export type PaymentsSwapQuoteRequest = paths["/v1/swap/quote"]["get"]["parameters"]["query"];
export type PaymentsSwapQuoteResponse = components["schemas"]["SwapQuoteResponse"];
export type PaymentsSwapRequest = components["schemas"]["SwapRequest"];
export type PaymentsSwapResponse = components["schemas"]["SwapResponse"];
export type UnsignedTransactionResponse = components["schemas"]["UnsignedTransactionResponse"];

export function createPaymentsClient(baseUrl = DEFAULT_PAYMENTS_API_BASE_URL) {
  return createClient<paths>({ baseUrl });
}

export async function buildUnsignedTransferTransaction(
  request: PaymentsTransferRequest,
  baseUrl = DEFAULT_PAYMENTS_API_BASE_URL,
): Promise<UnsignedTransactionResponse> {
  const client = createPaymentsClient(baseUrl);
  const { data, error, response } = await client.POST("/v1/spl/transfer", {
    body: request,
  });

  if (!response.ok || !data) {
    const message = error ? formatApiError(error) : `${response.status} ${response.statusText}`;
    throw new MirageError(`Payments API request failed: ${message}`);
  }

  return data;
}

export async function fetchSwapQuote(
  request: PaymentsSwapQuoteRequest,
  baseUrl = DEFAULT_PAYMENTS_API_BASE_URL,
): Promise<PaymentsSwapQuoteResponse> {
  const client = createPaymentsClient(baseUrl);
  const { data, error, response } = await client.GET("/v1/swap/quote", {
    params: {
      query: request,
    },
  });

  if (!response.ok || !data) {
    const message = error ? formatApiError(error) : `${response.status} ${response.statusText}`;
    throw new MirageError(`Payments API request failed: ${message}`);
  }

  return data;
}

export async function buildUnsignedSwapTransaction(
  request: PaymentsSwapRequest,
  baseUrl = DEFAULT_PAYMENTS_API_BASE_URL,
): Promise<PaymentsSwapResponse> {
  const client = createPaymentsClient(baseUrl);
  const { data, error, response } = await client.POST("/v1/swap/swap", {
    body: request,
  });

  if (!response.ok || !data) {
    const message = error ? formatApiError(error) : `${response.status} ${response.statusText}`;
    throw new MirageError(`Payments API request failed: ${message}`);
  }

  return data;
}

function formatApiError(error: unknown): string {
  if (error && typeof error === "object" && "error" in error) {
    const payload = error as {
      error?: {
        code?: string;
        message?: string;
      };
    };

    const code = payload.error?.code;
    const message = payload.error?.message;

    if (message) {
      return code ? `${code}: ${message}` : message;
    }
  }

  return "Unknown API error";
}
