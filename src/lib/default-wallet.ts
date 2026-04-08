import { listWallets, type WalletInfo } from "@open-wallet-standard/core";

import { MirageError } from "./errors.js";
import { runOwsCli } from "./ows.js";

export const DEFAULT_OWS_WALLET = "agent-treasury";

export interface DefaultWalletRuntime {
  listWallets: () => Array<Pick<WalletInfo, "id" | "name">>;
  runOwsCli: (args: string[]) => Promise<number>;
}

const defaultRuntime: DefaultWalletRuntime = {
  listWallets: () => listWallets(),
  runOwsCli,
};

export async function ensureWalletForDefaultBehavior(
  wallet: string = DEFAULT_OWS_WALLET,
  runtime: DefaultWalletRuntime = defaultRuntime,
): Promise<string> {
  if (hasWallet(wallet, runtime.listWallets())) {
    return wallet;
  }

  if (wallet !== DEFAULT_OWS_WALLET) {
    throw new MirageError(`OWS wallet "${wallet}" was not found.`);
  }

  console.error(`Creating OWS wallet "${DEFAULT_OWS_WALLET}"...`);

  const createExitCode = await runtime.runOwsCli([
    "wallet",
    "create",
    "--name",
    DEFAULT_OWS_WALLET,
  ]);

  if (createExitCode !== 0) {
    throw new MirageError(
      `Failed to create OWS wallet "${DEFAULT_OWS_WALLET}".`,
      createExitCode,
    );
  }

  return DEFAULT_OWS_WALLET;
}

function hasWallet(
  walletName: string,
  wallets: Array<Pick<WalletInfo, "id" | "name">>,
): boolean {
  return wallets.some((wallet) => wallet.name === walletName || wallet.id === walletName);
}
