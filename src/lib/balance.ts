import { listWallets } from "@open-wallet-standard/core";

import {
  DEFAULT_OWS_WALLET,
  ensureWalletForDefaultBehavior,
  type DefaultWalletRuntime,
} from "./default-wallet.js";
import { MirageError } from "./errors.js";
import { runOwsCli } from "./ows.js";

export const DEFAULT_BALANCE_WALLET = DEFAULT_OWS_WALLET;
export const DEFAULT_BALANCE_CHAIN = "solana";

export interface BalanceRuntime extends DefaultWalletRuntime {}

export interface BalanceOptions {
  wallet?: string;
}

const defaultRuntime: BalanceRuntime = {
  listWallets: () => listWallets(),
  runOwsCli,
};

export async function executeBalance(
  options: BalanceOptions = {},
  runtime: BalanceRuntime = defaultRuntime,
): Promise<void> {
  const wallet = await ensureWalletForDefaultBehavior(
    options.wallet ?? DEFAULT_BALANCE_WALLET,
    runtime,
  );

  const balanceExitCode = await runtime.runOwsCli([
    "fund",
    "balance",
    "--wallet",
    wallet,
    "--chain",
    DEFAULT_BALANCE_CHAIN,
  ]);

  if (balanceExitCode !== 0) {
    throw new MirageError(
      `Failed to fetch balance for "${wallet}".`,
      balanceExitCode,
    );
  }
}
