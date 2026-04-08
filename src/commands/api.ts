import {
  InvalidOptionArgumentError,
  Option,
  type Command,
} from "commander";

import { assertHttpUrl } from "../lib/config.js";
import { MirageError } from "../lib/errors.js";
import { DEFAULT_PAYMENTS_API_BASE_URL } from "../lib/payments.js";
import {
  generatedCommands,
  type GeneratedCommandOption,
  type GeneratedCommandSpec,
} from "../generated/payments-cli.js";

export function registerApiCommand(program: Command): void {
  const api = program
    .command("api")
    .description("Low-level payments API commands generated from the checked-in OpenAPI schema.");

  for (const spec of generatedCommands) {
    const command = api
      .command(spec.name)
      .description(`${spec.method.toUpperCase()} ${spec.path}. ${spec.description}`);

    for (const option of spec.options) {
      command.addOption(buildGeneratedOption(option));
    }

    command
      .addOption(
        new Option("--api-base-url <url>", "Override the payments API base URL.")
          .argParser(parseHttpUrl),
      )
      .action(async (options: Record<string, unknown>) => {
        const payload = await invokeGeneratedCommand(spec, options);

        if (typeof payload === "string") {
          console.log(payload);
          return;
        }

        console.log(JSON.stringify(payload, null, 2));
      });
  }
}

function buildGeneratedOption(spec: GeneratedCommandOption): Option {
  const option = new Option(spec.flag, spec.description).argParser((value: string) =>
    parseGeneratedValue(value, spec),
  );

  if (spec.enumValues?.length) {
    option.choices(spec.enumValues);
  }

  if (spec.required) {
    option.makeOptionMandatory(true);
  }

  return option;
}

async function invokeGeneratedCommand(
  spec: GeneratedCommandSpec,
  options: Record<string, unknown>,
): Promise<unknown> {
  const apiBaseUrl =
    typeof options.apiBaseUrl === "string"
      ? options.apiBaseUrl
      : DEFAULT_PAYMENTS_API_BASE_URL;
  const url = new URL(spec.path, apiBaseUrl);
  const body: Record<string, unknown> = {};

  for (const option of spec.options) {
    const value = options[option.optionKey];

    if (value === undefined) {
      continue;
    }

    if (option.location === "query" || option.location === "path") {
      url.searchParams.set(option.name, String(value));
      continue;
    }

    body[option.name] = value;
  }

  const response = await fetch(url, {
    body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
    headers: {
      Accept: "application/json",
      ...(Object.keys(body).length > 0
        ? { "Content-Type": "application/json" }
        : {}),
    },
    method: spec.method.toUpperCase(),
  });
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new MirageError(
      `Payments API request failed for ${spec.method.toUpperCase()} ${spec.path}: ${formatApiFailure(payload, response.status, response.statusText)}`,
    );
  }

  return payload;
}

function parseGeneratedValue(
  value: string,
  spec: GeneratedCommandOption,
): boolean | number | string {
  if (spec.type === "boolean") {
    if (value === "true" || value === "1") {
      return true;
    }

    if (value === "false" || value === "0") {
      return false;
    }

    throw new InvalidOptionArgumentError("Expected `true` or `false`.");
  }

  if (spec.type === "integer") {
    const parsed = Number(value);

    if (!Number.isSafeInteger(parsed)) {
      throw new InvalidOptionArgumentError("Expected a safe integer.");
    }

    if (spec.minimum !== undefined && parsed < spec.minimum) {
      throw new InvalidOptionArgumentError(`Expected a value greater than or equal to ${spec.minimum}.`);
    }

    if (spec.maximum !== undefined && parsed > spec.maximum) {
      throw new InvalidOptionArgumentError(`Expected a value less than or equal to ${spec.maximum}.`);
    }

    return parsed;
  }

  if (spec.pattern && !(new RegExp(spec.pattern).test(value))) {
    throw new InvalidOptionArgumentError(`Value does not match pattern ${spec.pattern}.`);
  }

  return value;
}

function parseHttpUrl(value: string): string {
  assertHttpUrl(value);
  return value;
}

function formatApiFailure(
  payload: unknown,
  status: number,
  statusText: string,
): string {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = payload as {
      error?: {
        code?: string;
        message?: string;
      };
    };

    if (error.error?.message) {
      return error.error.code
        ? `${error.error.code}: ${error.error.message}`
        : error.error.message;
    }
  }

  if (typeof payload === "string" && payload.length > 0) {
    return payload;
  }

  return `${status} ${statusText}`;
}
