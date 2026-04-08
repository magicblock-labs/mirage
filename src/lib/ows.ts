import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

import { getWallet, type AccountInfo, type WalletInfo } from "@open-wallet-standard/core";

import { MirageError } from "./errors.js";

const require = createRequire(import.meta.url);

export function findSolanaAccount(wallet: WalletInfo): AccountInfo {
  const account = wallet.accounts.find((candidate) =>
    candidate.chainId.startsWith("solana:"),
  );

  if (!account) {
    throw new MirageError(`Wallet "${wallet.name}" does not contain a Solana account.`);
  }

  return account;
}

export function resolveWalletSolanaAddress(walletNameOrId: string, vaultPath?: string): string {
  const wallet = getWallet(walletNameOrId, vaultPath);
  return findSolanaAccount(wallet).address;
}

export function resolveOwsCliPath(): string {
  const entryPath = require.resolve("@open-wallet-standard/core");
  return join(dirname(entryPath), "bin", "ows");
}

export async function runOwsCli(args: string[]): Promise<number> {
  const cliPath = resolveOwsCliPath();

  return await new Promise<number>((resolve, reject) => {
    const child = spawn(process.execPath, [cliPath, ...args], {
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`ows terminated with signal ${signal}.`));
        return;
      }

      resolve(code ?? 1);
    });
  });
}
