import {
  InvalidOptionArgumentError,
  Option,
  type Command,
} from "commander";

import { assertHttpUrl, readConfig } from "../lib/config.js";
import {
  DEFAULT_SWAP_WALLET,
  executeSwap,
  resolveSwapNetwork,
  type SwapMode,
  type SwapVisibility,
} from "../lib/swap.js";

interface SwapCliOptions {
  amount: string;
  apiBaseUrl?: string;
  asLegacyTransaction?: boolean;
  blockhashSlotsToExpiry?: number;
  clientRefId?: string;
  cluster?: string;
  computeUnitPriceMicroLamports?: number;
  destination?: string;
  destinationTokenAccount?: string;
  dexes?: string;
  dynamicComputeUnitLimit?: boolean;
  dynamicSlippage?: boolean;
  excludeDexes?: string;
  feeAccount?: string;
  forJitoBundle?: boolean;
  from?: string;
  inputMint: string;
  instructionVersion?: "V1" | "V2";
  json?: boolean;
  maxAccounts?: number;
  maxDelayMs?: string;
  minDelayMs?: string;
  nativeDestinationAccount?: string;
  onlyDirectRoutes?: boolean;
  outputMint: string;
  passphrase?: string;
  payer?: string;
  platformFeeBps?: number;
  prioritizationFeeLamports?: number;
  restrictIntermediateTokens?: boolean;
  rpcUrl?: string;
  skipUserAccountsRpcCalls?: boolean;
  slippageBps?: number;
  split?: number;
  supportDynamicIntermediateTokens?: boolean;
  swapMode: SwapMode;
  trackingAccount?: string;
  useSharedAccounts?: boolean;
  validator?: string;
  vaultPath?: string;
  visibility: SwapVisibility;
  wallet?: string;
  wrapAndUnwrapSol?: boolean;
}

export function registerSwapCommand(program: Command): void {
  program
    .command("swap")
    .description("Quote, build, sign, and send a MagicBlock swap with an OWS Solana wallet.")
    .option(
      "--wallet <wallet>",
      `OWS wallet name or ID used to sign and send the swap. Defaults to ${DEFAULT_SWAP_WALLET}.`,
      DEFAULT_SWAP_WALLET,
    )
    .option("--from <address>", "Override the signer address. Defaults to the wallet's Solana account.")
    .requiredOption("--input-mint <address>", "Input SPL mint address.")
    .requiredOption("--output-mint <address>", "Output SPL mint address.")
    .requiredOption(
      "--amount <amount>",
      "Token amount in UI units. Uses input mint decimals for ExactIn and output mint decimals for ExactOut.",
      parsePositiveDecimal,
    )
    .option("--slippage-bps <bps>", "Slippage threshold in basis points.", parseNonNegativeInteger)
    .addOption(
      new Option("--swap-mode <mode>", "Swap quote mode.")
        .choices(["ExactIn", "ExactOut"])
        .default("ExactIn"),
    )
    .addOption(
      new Option("--visibility <visibility>", "Swap visibility.")
        .choices(["public", "private"])
        .default("public"),
    )
    .option("--destination <address>", "Private swap final recipient. Required when --visibility private.")
    .option("--min-delay-ms <ms>", "Private swap minimum delay in milliseconds.", parseDigitString)
    .option("--max-delay-ms <ms>", "Private swap maximum delay in milliseconds.", parseDigitString)
    .option("--split <count>", "Private swap split count between 1 and 14.", parseSplit)
    .option("--client-ref-id <id>", "Optional private swap client correlation ID.", parseDigitString)
    .option("--validator <address>", "Explicit MagicBlock validator identity.")
    .option("--cluster <cluster>", "Use `mainnet`, `devnet`, or a custom base RPC URL for Solana RPC calls.")
    .option(
      "--rpc-url <url>",
      "Override the Solana RPC URL used for mint decimals and transaction broadcast.",
      parseHttpUrl,
    )
    .option("--dexes <labels>", "Comma-separated DEX labels to include in quote routing.")
    .option("--exclude-dexes <labels>", "Comma-separated DEX labels to exclude from quote routing.")
    .option("--restrict-intermediate-tokens", "Restrict quote routing to a more stable intermediate-token set.")
    .option("--only-direct-routes", "Limit quote routing to direct routes.")
    .option("--as-legacy-transaction", "Request a legacy transaction-compatible route and swap transaction.")
    .option("--platform-fee-bps <bps>", "Optional platform fee in basis points.", parseNonNegativeInteger)
    .option("--max-accounts <count>", "Approximate maximum account budget for the quote route.", parseNonNegativeInteger)
    .addOption(
      new Option("--instruction-version <version>", "Quote instruction format.")
        .choices(["V1", "V2"]),
    )
    .option("--dynamic-slippage", "Let the upstream quote or swap builder overwrite slippage.")
    .option("--for-jito-bundle", "Exclude quote routes incompatible with Jito bundles.")
    .option("--support-dynamic-intermediate-tokens", "Allow dynamic quote intermediate-token selection.")
    .option("--payer <address>", "Optional fee payer for transaction fees and rent.")
    .option("--wrap-and-unwrap-sol", "Automatically wrap and unwrap native SOL when needed.")
    .option("--use-shared-accounts", "Allow shared accounts for intermediate routing state.")
    .option("--fee-account <address>", "Optional initialized token account used to collect platform fees.")
    .option("--tracking-account <address>", "Optional public key used for downstream transaction tracking.")
    .option("--prioritization-fee-lamports <lamports>", "Fixed priority fee in lamports.", parseNonNegativeInteger)
    .option("--destination-token-account <address>", "Optional destination token account for public swap output.")
    .option("--native-destination-account <address>", "Optional destination account for native SOL output.")
    .option("--dynamic-compute-unit-limit", "Estimate compute usage and set the compute unit limit automatically.")
    .option("--skip-user-accounts-rpc-calls", "Skip extra RPC checks for required user accounts.")
    .option("--compute-unit-price-micro-lamports <price>", "Exact compute unit price in micro-lamports.", parseNonNegativeInteger)
    .option("--blockhash-slots-to-expiry <slots>", "Transaction expiry window in slots.", parseNonNegativeInteger)
    .option("--passphrase <passphrase>", "OWS wallet passphrase. Prefer OWS_PASSPHRASE to avoid shell history.")
    .option("--vault-path <path>", "Override the OWS vault directory.")
    .addOption(
      new Option("--api-base-url <url>", "Override the payments API base URL for testing.")
        .hideHelp()
        .argParser(parseHttpUrl),
    )
    .option("--json", "Output machine-readable JSON.")
    .action(async (options: SwapCliOptions) => {
      const config = await readConfig();
      const network = resolveSwapNetwork({
        cluster: options.cluster,
        rpcUrl: options.rpcUrl,
        storedRpcUrl: config.rpcUrl,
      });

      const result = await executeSwap({
        ...options,
        ...network,
      });

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      console.log(`Signature: ${result.txHash}`);
      console.log(`From: ${result.from}`);
      console.log(`Input: ${result.quote.inAmount} ${result.quote.inputMint}`);
      console.log(`Output: ${result.quote.outAmount} ${result.quote.outputMint}`);

      if (result.swapTransaction.privateTransfer) {
        console.log(`Private stash ATA: ${result.swapTransaction.privateTransfer.stashAta}`);
      }

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

  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 14) {
    throw new InvalidOptionArgumentError("Expected a split value between 1 and 14.");
  }

  return parsed;
}

function parseDigitString(value: string): string {
  if (!/^\d+$/.test(value)) {
    throw new InvalidOptionArgumentError("Expected a string containing only digits.");
  }

  return value;
}

function parseNonNegativeInteger(value: string): number {
  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new InvalidOptionArgumentError("Expected a non-negative integer.");
  }

  return parsed;
}

function parseHttpUrl(value: string): string {
  assertHttpUrl(value);
  return value;
}
