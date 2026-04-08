import {
  InvalidOptionArgumentError,
  Option,
  type Command,
} from "commander";

import { assertHttpUrl, readConfig } from "../lib/config.js";
import {
  DEFAULT_TRANSFER_MINT,
  DEFAULT_TRANSFER_WALLET,
  executeTransfer,
  resolveTransferNetwork,
} from "../lib/transfer.js";

interface TransferCliOptions {
  apiBaseUrl?: string;
  amount: string;
  clientRefId?: string;
  cluster?: string;
  from?: string;
  fromBalance: "base" | "ephemeral";
  initAtasIfMissing: boolean;
  initIfMissing: boolean;
  initVaultIfMissing: boolean;
  json?: boolean;
  maxDelayMs?: string;
  memo?: string;
  minDelayMs?: string;
  mint?: string;
  passphrase?: string;
  rpcUrl?: string;
  split?: number;
  to: string;
  toBalance: "base" | "ephemeral";
  validator?: string;
  vaultPath?: string;
  visibility: "public" | "private";
  wallet?: string;
}

export function registerTransferCommand(program: Command): void {
  program
    .command("transfer")
    .description("Build, sign, and send a MagicBlock SPL transfer with an OWS Solana wallet.")
    .option(
      "--wallet <wallet>",
      `OWS wallet name or ID used to sign and send the transfer. Defaults to ${DEFAULT_TRANSFER_WALLET}.`,
      DEFAULT_TRANSFER_WALLET,
    )
    .option("--from <address>", "Override the sender address. Defaults to the wallet's Solana account.")
    .requiredOption("--to <address>", "Destination Solana address.")
    .option(
      "--mint <address>",
      `SPL mint address. Defaults to mainnet USDC (${DEFAULT_TRANSFER_MINT}).`,
    )
    .requiredOption(
      "--amount <amount>",
      "Token amount in UI units, for example 1 or 0.1.",
      parsePositiveDecimal,
    )
    .addOption(
      new Option("--visibility <visibility>", "Transfer visibility.")
        .choices(["public", "private"])
        .default("private"),
    )
    .addOption(
      new Option("--from-balance <location>", "Source balance location.")
        .choices(["base", "ephemeral"])
        .default("base"),
    )
    .addOption(
      new Option("--to-balance <location>", "Destination balance location.")
        .choices(["base", "ephemeral"])
        .default("base"),
    )
    .option("--cluster <cluster>", "Use `mainnet`, `devnet`, or a custom base RPC URL for the payments API request.")
    .option(
      "--rpc-url <url>",
      "Override the Solana RPC URL used to broadcast the signed transaction.",
      parseHttpUrl,
    )
    .option("--validator <address>", "Explicit MagicBlock validator identity.")
    .option("--memo <memo>", "Append a UTF-8 memo to the transfer.")
    .option("--min-delay-ms <ms>", "Private transfer minimum delay in milliseconds.", parseDigitString)
    .option("--max-delay-ms <ms>", "Private transfer maximum delay in milliseconds.", parseDigitString)
    .option("--client-ref-id <id>", "Optional encrypted client reference ID for private transfers.")
    .option("--split <count>", "Private transfer split count between 1 and 15.", parseSplit)
    .option("--no-init-if-missing", "Do not initialize missing private accounts.")
    .option("--no-init-atas-if-missing", "Do not initialize missing associated token accounts.")
    .option("--init-vault-if-missing", "Initialize missing token vaults.")
    .option("--passphrase <passphrase>", "OWS wallet passphrase. Prefer OWS_PASSPHRASE to avoid shell history.")
    .option("--vault-path <path>", "Override the OWS vault directory.")
    .addOption(
      new Option("--api-base-url <url>", "Override the payments API base URL for testing.")
        .hideHelp()
        .argParser(parseHttpUrl),
    )
    .option("--json", "Output machine-readable JSON.")
    .action(async (options: TransferCliOptions) => {
      const config = await readConfig();
      const network = resolveTransferNetwork({
        cluster: options.cluster,
        rpcUrl: options.rpcUrl,
        storedRpcUrl: config.rpcUrl,
      });

      const result = await executeTransfer({
        ...options,
        ...network,
      });

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      console.log(`Signature: ${result.txHash}`);
      console.log(`From: ${result.from}`);

      if (result.rpcUrl) {
        console.log(`RPC: ${result.rpcUrl}`);
      }
    });
}

function parsePositiveDecimal(value: string): string {
  const normalized = value.trim();

  if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
    throw new InvalidOptionArgumentError(
      "Expected a positive decimal value such as 1 or 0.1.",
    );
  }

  return normalized;
}

function parseSplit(value: string): number {
  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new InvalidOptionArgumentError("Expected a positive integer.");
  }

  if (parsed > 15) {
    throw new InvalidOptionArgumentError("Expected a split value between 1 and 15.");
  }

  return parsed;
}

function parseDigitString(value: string): string {
  if (!/^\d+$/.test(value)) {
    throw new InvalidOptionArgumentError("Expected a string containing only digits.");
  }

  return value;
}

function parseHttpUrl(value: string): string {
  assertHttpUrl(value);
  return value;
}
