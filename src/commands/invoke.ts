import { type Command, InvalidOptionArgumentError } from "commander";

import { assertHttpUrl, readConfig } from "../lib/config.js";
import {
  DEFAULT_INVOKE_WALLET,
  executeInvoke,
  type InvokeResult,
} from "../lib/invoke.js";
import { resolveSolanaRpcUrl } from "../lib/solana.js";

interface InvokeCliOptions {
  cluster?: string;
  idl?: string;
  json?: boolean;
  passphrase?: string;
  rpcUrl?: string;
  vaultPath?: string;
  wallet?: string;
  yes?: boolean;
}

export function registerInvokeCommand(program: Command): void {
  program
    .command("invoke")
    .argument("<program-id>", "Solana program ID to invoke.")
    .description(
      "Fetch an Anchor program's IDL, interactively pick instructions, then build, sign, and send the transaction.",
    )
    .option(
      "--wallet <wallet>",
      `OWS wallet name or ID used as fee payer and signer. Defaults to ${DEFAULT_INVOKE_WALLET}.`,
      DEFAULT_INVOKE_WALLET,
    )
    .option("--idl <path>", "Use a local IDL JSON file instead of fetching the on-chain IDL.")
    .option("--cluster <cluster>", "Use `mainnet`, `devnet`, or a custom RPC URL.")
    .option("--rpc-url <url>", "Override the Solana RPC URL used for IDL fetch and broadcast.", parseHttpUrl)
    .option("--passphrase <passphrase>", "OWS wallet passphrase. Prefer OWS_PASSPHRASE to avoid shell history.")
    .option("--vault-path <path>", "Override the OWS vault directory.")
    .option("-y, --yes", "Skip the final confirmation prompt before signing.")
    .option("--json", "Output machine-readable JSON.")
    .action(async (programId: string, options: InvokeCliOptions) => {
      const config = await readConfig();
      const rpcUrl = options.rpcUrl
        ?? (options.cluster ? resolveSolanaRpcUrl(options.cluster) : config.rpcUrl);

      const result = await executeInvoke({
        cluster: options.cluster,
        idlPath: options.idl,
        passphrase: options.passphrase,
        programId,
        rpcUrl,
        vaultPath: options.vaultPath,
        wallet: options.wallet,
        yes: options.yes,
      });

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      printHumanSummary(result);
    });
}

function printHumanSummary(result: InvokeResult): void {
  console.log(`\nSignature: ${result.txHash}`);
  console.log(`From:      ${result.from}`);
  console.log(`Program:   ${result.programId}`);

  if (result.rpcUrl) {
    console.log(`RPC:       ${result.rpcUrl}`);
  }

  const explorerUrl = buildExplorerUrl(result.txHash, result.rpcUrl);

  if (explorerUrl) {
    console.log(`Explorer:  ${explorerUrl}`);
  }
}

function buildExplorerUrl(signature: string, rpcUrl?: string): string | null {
  if (!rpcUrl) {
    return `https://explorer.solana.com/tx/${signature}`;
  }

  if (rpcUrl.includes("devnet")) {
    return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
  }

  if (rpcUrl.includes("mainnet") || rpcUrl.includes("api.mainnet-beta")) {
    return `https://explorer.solana.com/tx/${signature}`;
  }

  return null;
}

function parseHttpUrl(value: string): string {
  try {
    assertHttpUrl(value);
  } catch (error) {
    throw new InvalidOptionArgumentError((error as Error).message);
  }

  return value;
}
