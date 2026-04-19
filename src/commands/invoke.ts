import { type Command, InvalidOptionArgumentError } from "commander";

import { assertHttpUrl, readConfig } from "../lib/config.js";
import { MirageError } from "../lib/errors.js";
import {
  DEFAULT_INVOKE_WALLET,
  executeInvoke,
  inspectIdl,
  type InvokeResult,
} from "../lib/invoke.js";
import { resolveSolanaRpcUrl } from "../lib/solana.js";

interface InvokeCliOptions {
  account?: string[];
  arg?: string[];
  cluster?: string;
  dryRun?: boolean;
  idl?: string;
  ix?: string[];
  json?: boolean;
  passphrase?: string;
  rpcUrl?: string;
  showIdl?: boolean;
  vaultPath?: string;
  wallet?: string;
  yes?: boolean;
}

export function registerInvokeCommand(program: Command): void {
  program
    .command("invoke")
    .argument("<program-id>", "Solana program ID to invoke.")
    .description(
      "Fetch an Anchor program's IDL, interactively pick instructions, then build, sign, and send the transaction. Supports non-interactive flags for scripting and agent use.",
    )
    .option(
      "--wallet <wallet>",
      `OWS wallet name or ID used as fee payer and signer. Defaults to ${DEFAULT_INVOKE_WALLET}.`,
      DEFAULT_INVOKE_WALLET,
    )
    .option("--idl <path>", "Use a local IDL JSON file instead of fetching the on-chain IDL.")
    .option("--cluster <cluster>", "Use `mainnet`, `devnet`, or a custom RPC URL.")
    .option("--rpc-url <url>", "Override the Solana RPC URL used for IDL fetch and broadcast.", parseHttpUrl)
    .option(
      "--ix <name>",
      "Select an instruction by name (repeatable). When set, skips the interactive picker.",
      collectRepeated,
      [] as string[],
    )
    .option(
      "--arg <ix.name=value>",
      "Non-interactive argument value, scoped by instruction name. Repeatable.",
      collectRepeated,
      [] as string[],
    )
    .option(
      "--account <ix.name=pubkey>",
      "Non-interactive account override, scoped by instruction name. Repeatable.",
      collectRepeated,
      [] as string[],
    )
    .option("--passphrase <passphrase>", "OWS wallet passphrase. Prefer OWS_PASSPHRASE to avoid shell history.")
    .option("--vault-path <path>", "Override the OWS vault directory.")
    .option("-y, --yes", "Skip the final confirmation prompt before signing.")
    .option("--dry-run", "Resolve everything and print the transaction plan, but do not sign or send.")
    .option("--show-idl", "Emit the IDL catalog (instructions, args, account resolution hints) and exit.")
    .option("--json", "Output machine-readable JSON.")
    .action(async (programId: string, options: InvokeCliOptions) => {
      const config = await readConfig();
      const rpcUrl = options.rpcUrl
        ?? (options.cluster ? resolveSolanaRpcUrl(options.cluster) : config.rpcUrl);

      if (options.showIdl) {
        const catalog = await inspectIdl({
          cluster: options.cluster,
          idlPath: options.idl,
          programId,
          rpcUrl,
        });
        console.log(JSON.stringify(catalog, null, 2));
        return;
      }

      const argOverrides = parseScopedOverrides(options.arg ?? [], "--arg");
      const accountOverrides = parseScopedOverrides(options.account ?? [], "--account");
      const selection = options.ix && options.ix.length > 0 ? options.ix : undefined;

      const result = await executeInvoke({
        accountOverrides,
        argOverrides,
        cluster: options.cluster,
        dryRun: options.dryRun,
        idlPath: options.idl,
        passphrase: options.passphrase,
        programId,
        rpcUrl,
        selection,
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
  if (result.dryRun) {
    console.log("\nDry-run: transaction was built and resolved but not signed.");
    console.log(`From:    ${result.from}`);
    console.log(`Program: ${result.programId}`);

    if (result.rpcUrl) {
      console.log(`RPC:     ${result.rpcUrl}`);
    }

    return;
  }

  console.log(`\nSignature: ${result.txHash}`);
  console.log(`From:      ${result.from}`);
  console.log(`Program:   ${result.programId}`);

  if (result.rpcUrl) {
    console.log(`RPC:       ${result.rpcUrl}`);
  }

  if (result.txHash) {
    const explorerUrl = buildExplorerUrl(result.txHash, result.rpcUrl);
    if (explorerUrl) {
      console.log(`Explorer:  ${explorerUrl}`);
    }
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

function collectRepeated(value: string, previous: string[] = []): string[] {
  return [...previous, value];
}

function parseScopedOverrides(
  values: string[],
  flagName: string,
): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};

  for (const raw of values) {
    const eqIndex = raw.indexOf("=");

    if (eqIndex <= 0) {
      throw new MirageError(`${flagName} expects ix.name=value, got "${raw}".`);
    }

    const key = raw.slice(0, eqIndex);
    const value = raw.slice(eqIndex + 1);
    const dotIndex = key.indexOf(".");

    if (dotIndex <= 0 || dotIndex === key.length - 1) {
      throw new MirageError(`${flagName} expects ix.name=value, got "${raw}".`);
    }

    const ixName = key.slice(0, dotIndex);
    const fieldName = key.slice(dotIndex + 1);
    const bucket = result[ixName] ?? (result[ixName] = {});
    bucket[fieldName] = value;
  }

  return result;
}
