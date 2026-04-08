import {
  getWallet as getOwsWallet,
  listWallets,
  type WalletInfo,
} from "@open-wallet-standard/core";

import {
  DEFAULT_OWS_WALLET,
  ensureWalletForDefaultBehavior,
  type DefaultWalletRuntime,
} from "./default-wallet.js";
import { findSolanaAccount, runOwsCli } from "./ows.js";

export interface AddressOptions {
  wallet?: string;
}

export interface AddressRuntime extends DefaultWalletRuntime {
  getWallet: (wallet: string) => WalletInfo;
}

const defaultRuntime: AddressRuntime = {
  getWallet: (wallet) => getOwsWallet(wallet),
  listWallets: () => listWallets(),
  runOwsCli,
};

export async function executeAddress(
  options: AddressOptions = {},
  runtime: AddressRuntime = defaultRuntime,
): Promise<string> {
  const wallet = await ensureWalletForDefaultBehavior(
    options.wallet ?? DEFAULT_OWS_WALLET,
    runtime,
  );

  return findSolanaAccount(runtime.getWallet(wallet)).address;
}
