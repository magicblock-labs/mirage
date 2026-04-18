import { isHttpUrl } from "./config.js";
import { MirageError } from "./errors.js";

export const DEFAULT_MAINNET_RPC_URL = "https://api.mainnet-beta.solana.com";
export const DEFAULT_DEVNET_RPC_URL = "https://api.devnet.solana.com";

interface JsonRpcResponse {
  error?: {
    code?: number;
    data?: unknown;
    message?: string;
  };
  result?: {
    value?: {
      data?: {
        parsed?: {
          info?: {
            decimals?: number;
          };
        };
      } | null;
    } | null;
  };
}

interface SendTransactionJsonRpcResponse {
  error?: {
    code?: number;
    data?: unknown;
    message?: string;
  };
  result?: string;
}

export function resolveSolanaRpcUrl(cluster?: string, rpcUrl?: string): string {
  if (rpcUrl) {
    return rpcUrl;
  }

  if (!cluster || cluster === "mainnet") {
    return DEFAULT_MAINNET_RPC_URL;
  }

  if (cluster === "devnet") {
    return DEFAULT_DEVNET_RPC_URL;
  }

  if (isHttpUrl(cluster)) {
    return cluster;
  }

  throw new MirageError(
    `Unable to resolve an RPC URL from cluster "${cluster}". Pass --rpc-url or use --cluster mainnet|devnet|https://...`,
  );
}

export async function fetchMintDecimals(
  mint: string,
  rpcUrl: string,
): Promise<number> {
  const response = await fetch(rpcUrl, {
    body: JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "getAccountInfo",
      params: [
        mint,
        {
          commitment: "confirmed",
          encoding: "jsonParsed",
        },
      ],
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new MirageError(
      `Failed to fetch mint decimals for ${mint}: ${response.status} ${response.statusText}`,
    );
  }

  const payload = (await response.json()) as JsonRpcResponse;

  if (payload.error) {
    throw new MirageError(
      `Failed to fetch mint decimals for ${mint}: ${payload.error.message ?? "unknown RPC error"}`,
    );
  }

  const decimals = payload.result?.value?.data?.parsed?.info?.decimals;

  if (typeof decimals !== "number" || !Number.isInteger(decimals) || decimals < 0) {
    throw new MirageError(`Unable to read mint decimals for ${mint} from ${rpcUrl}.`);
  }

  return decimals;
}

export async function sendRawSolanaTransaction(
  transactionBase64: string,
  rpcUrl: string,
): Promise<{ txHash: string }> {
  const response = await fetch(rpcUrl, {
    body: JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "sendTransaction",
      params: [
        transactionBase64,
        {
          encoding: "base64",
          preflightCommitment: "processed",
        },
      ],
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new MirageError(
      `Failed to send transaction on ${rpcUrl}: ${response.status} ${response.statusText}`,
    );
  }

  const payload = (await response.json()) as SendTransactionJsonRpcResponse;

  if (payload.error) {
    throw new MirageError(`broadcast failed: RPC error: ${JSON.stringify(payload.error)}`);
  }

  if (typeof payload.result !== "string" || payload.result.length === 0) {
    throw new MirageError(`Failed to send transaction on ${rpcUrl}: missing signature.`);
  }

  return {
    txHash: payload.result,
  };
}

export function attachSignatureToTransaction(
  transactionBase64: string,
  signatureHex: string,
): string {
  const transaction = Buffer.from(transactionBase64, "base64");
  const signature = Buffer.from(signatureHex, "hex");
  const [signatureCount, signaturePrefixLength] = readShortVec(transaction, 0);

  if (signatureCount < 1) {
    throw new MirageError("Unsigned Solana transaction did not reserve any signatures.");
  }

  if (signature.length !== 64) {
    throw new MirageError("OWS returned an invalid Solana signature length.");
  }

  signature.copy(transaction, signaturePrefixLength);
  return transaction.toString("base64");
}

function readShortVec(buffer: Buffer, offset: number): [number, number] {
  let value = 0;
  let length = 0;
  let shift = 0;

  while (true) {
    const byte = buffer[offset + length];

    if (byte === undefined) {
      throw new MirageError("Unsigned Solana transaction ended before the signature prefix was complete.");
    }

    value |= (byte & 0x7f) << shift;
    length += 1;

    if ((byte & 0x80) === 0) {
      return [value, length];
    }

    shift += 7;
  }
}

export function convertUiAmountToBaseUnits(
  amount: string,
  decimals: number,
): number {
  const normalized = amount.trim();

  if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
    throw new MirageError(
      `Invalid amount "${amount}". Expected a positive decimal value such as 1 or 0.1.`,
    );
  }

  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new MirageError(`Invalid mint decimals value ${decimals}.`);
  }

  const [wholePart = "0", fractionPart = ""] = normalized.split(".");

  if (fractionPart.length > decimals) {
    throw new MirageError(
      `Amount "${amount}" has too many decimal places for this mint. Maximum supported decimals: ${decimals}.`,
    );
  }

  const scale = 10n ** BigInt(decimals);
  const wholeUnits = BigInt(wholePart) * scale;
  const fractionUnits = fractionPart.length > 0
    ? BigInt(fractionPart.padEnd(decimals, "0"))
    : 0n;
  const baseUnits = wholeUnits + fractionUnits;

  if (baseUnits < 1n) {
    throw new MirageError("Amount must be greater than zero.");
  }

  if (baseUnits > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new MirageError(
      `Amount "${amount}" is too large after conversion to base units.`,
    );
  }

  return Number(baseUnits);
}
