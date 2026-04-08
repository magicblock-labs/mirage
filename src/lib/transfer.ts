import {
  getWallet as getOwsWallet,
  listWallets,
  signTransaction as owsSignTransaction,
  signAndSend as owsSignAndSend,
  type SendResult,
  type SignResult,
  type WalletInfo,
} from "@open-wallet-standard/core";

import { isHttpUrl } from "./config.js";
import {
  DEFAULT_OWS_WALLET,
  ensureWalletForDefaultBehavior,
  type DefaultWalletRuntime,
} from "./default-wallet.js";
import { MirageError } from "./errors.js";
import {
  buildUnsignedTransferTransaction,
  type PaymentsTransferRequest,
  type UnsignedTransactionResponse,
} from "./payments.js";
import { findSolanaAccount, runOwsCli } from "./ows.js";
import { promptSecret } from "./prompt.js";
import {
  convertUiAmountToBaseUnits,
  fetchMintDecimals,
  resolveSolanaRpcUrl,
  sendRawSolanaTransaction,
} from "./solana.js";

export const DEFAULT_TRANSFER_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const DEFAULT_TRANSFER_WALLET = DEFAULT_OWS_WALLET;

export interface TransferNetworkOptions {
  cluster?: string;
  rpcUrl?: string;
  storedRpcUrl?: string;
}

export interface ResolvedTransferNetwork {
  cluster?: string;
  rpcUrl?: string;
}

export interface TransferOptions {
  apiBaseUrl?: string;
  amount: string;
  clientRefId?: string;
  cluster?: string;
  from?: string;
  fromBalance: "base" | "ephemeral";
  initAtasIfMissing: boolean;
  initIfMissing: boolean;
  initVaultIfMissing: boolean;
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

interface PreparedTransferRequestOptions
  extends Omit<
    TransferOptions,
    "apiBaseUrl" | "amount" | "passphrase" | "rpcUrl" | "vaultPath" | "wallet"
  > {
  amount: number;
  from: string;
  mint: string;
}

export interface TransferRuntime extends DefaultWalletRuntime {
  buildUnsignedTransfer: (
    request: PaymentsTransferRequest,
    baseUrl?: string,
  ) => Promise<UnsignedTransactionResponse>;
  getMintDecimals: (mint: string, rpcUrl: string) => Promise<number>;
  getWallet: (wallet: string, vaultPath?: string) => WalletInfo;
  promptSecret: (prompt: string) => Promise<string | undefined>;
  sendRawTransaction?: (transactionBase64: string, rpcUrl: string) => Promise<SendResult>;
  signTransaction?: (
    wallet: string,
    chain: string,
    txHex: string,
    passphrase?: string,
    index?: number,
    vaultPath?: string,
  ) => SignResult;
  signAndSend: (
    wallet: string,
    chain: string,
    txHex: string,
    passphrase?: string,
    index?: number,
    rpcUrl?: string,
    vaultPath?: string,
  ) => SendResult;
}

export interface TransferResult {
  from: string;
  request: PaymentsTransferRequest;
  rpcUrl?: string;
  txHash: string;
  unsignedTransaction: UnsignedTransactionResponse;
}

const defaultRuntime: TransferRuntime = {
  buildUnsignedTransfer: buildUnsignedTransferTransaction,
  getMintDecimals: fetchMintDecimals,
  getWallet: (wallet, vaultPath) => getOwsWallet(wallet, vaultPath),
  listWallets: () => listWallets(),
  promptSecret,
  runOwsCli,
  sendRawTransaction: (transactionBase64, rpcUrl) => sendRawSolanaTransaction(transactionBase64, rpcUrl),
  signTransaction: (wallet, chain, txHex, passphrase, index, vaultPath) =>
    owsSignTransaction(wallet, chain, txHex, passphrase, index, vaultPath),
  signAndSend: (wallet, chain, txHex, passphrase, index, rpcUrl, vaultPath) =>
    owsSignAndSend(wallet, chain, txHex, passphrase, index, rpcUrl, vaultPath),
};

export function resolveTransferNetwork(
  options: TransferNetworkOptions,
): ResolvedTransferNetwork {
  if (options.rpcUrl) {
    return options.cluster
      ? {
        cluster: options.cluster,
        rpcUrl: options.rpcUrl,
      }
      : {
        rpcUrl: options.rpcUrl,
      };
  }

  if (options.cluster) {
    return isHttpUrl(options.cluster)
      ? { cluster: options.cluster, rpcUrl: options.cluster }
      : {
        cluster: options.cluster,
        rpcUrl: resolveSolanaRpcUrl(options.cluster),
      };
  }

  if (options.storedRpcUrl) {
    return {
      rpcUrl: options.storedRpcUrl,
    };
  }

  return {};
}

export function buildTransferRequest(
  options: PreparedTransferRequestOptions,
): PaymentsTransferRequest {
  validateTransferOptions(options);

  return stripUndefined({
    amount: options.amount,
    clientRefId: options.clientRefId,
    cluster: options.cluster,
    from: options.from,
    fromBalance: options.fromBalance,
    initAtasIfMissing: options.initAtasIfMissing,
    initIfMissing: options.initIfMissing,
    initVaultIfMissing: options.initVaultIfMissing,
    maxDelayMs: options.maxDelayMs,
    memo: options.memo,
    minDelayMs: options.minDelayMs,
    mint: options.mint,
    split: options.split,
    to: options.to,
    toBalance: options.toBalance,
    validator: options.validator,
    visibility: options.visibility,
  }) as PaymentsTransferRequest;
}

export async function executeTransfer(
  options: TransferOptions,
  runtime: TransferRuntime = defaultRuntime,
): Promise<TransferResult> {
  const walletName = await ensureWalletForDefaultBehavior(
    options.wallet ?? DEFAULT_TRANSFER_WALLET,
    runtime,
  );
  const wallet = runtime.getWallet(walletName, options.vaultPath);
  const from = options.from ?? findSolanaAccount(wallet).address;
  const mint = options.mint ?? DEFAULT_TRANSFER_MINT;
  const broadcastRpcUrl = resolveSolanaRpcUrl(options.cluster, options.rpcUrl);
  const mintDecimals = await runtime.getMintDecimals(mint, broadcastRpcUrl);
  const baseUnitAmount = convertUiAmountToBaseUnits(options.amount, mintDecimals);
  const passphrase = await resolvePassphrase(options.passphrase, runtime);
  const request = buildTransferRequest({
    ...options,
    amount: baseUnitAmount,
    from,
    mint,
  });
  let unsignedTransaction = await runtime.buildUnsignedTransfer(
    request,
    options.apiBaseUrl,
  );
  let sentTransaction;

  try {
    sentTransaction = await signTransferTransaction(
      walletName,
      unsignedTransaction,
      passphrase,
      {
        rpcUrl: broadcastRpcUrl,
        vaultPath: options.vaultPath,
      },
      runtime,
    );
  } catch (error: unknown) {
    if (!isBlockhashNotFoundError(error)) {
      throw error;
    }

    unsignedTransaction = await runtime.buildUnsignedTransfer(
      request,
      options.apiBaseUrl,
    );
    sentTransaction = await signTransferTransaction(
      walletName,
      unsignedTransaction,
      passphrase,
      {
        rpcUrl: broadcastRpcUrl,
        vaultPath: options.vaultPath,
      },
      runtime,
    );
  }

  return {
    from,
    request,
    rpcUrl: options.rpcUrl,
    txHash: sentTransaction.txHash,
    unsignedTransaction,
  };
}

async function resolvePassphrase(
  cliPassphrase: string | undefined,
  runtime: TransferRuntime,
): Promise<string | undefined> {
  if (typeof cliPassphrase === "string" && cliPassphrase.length > 0) {
    return cliPassphrase;
  }

  const environmentPassphrase = process.env.OWS_PASSPHRASE;

  if (typeof environmentPassphrase === "string" && environmentPassphrase.length > 0) {
    return environmentPassphrase;
  }

  const prompted = await runtime.promptSecret(
    "OWS passphrase (press enter for none): ",
  );

  return prompted || undefined;
}

async function signTransferTransaction(
  walletName: string,
  unsignedTransaction: UnsignedTransactionResponse,
  passphrase: string | undefined,
  options: Pick<TransferOptions, "rpcUrl" | "vaultPath">,
  runtime: Pick<TransferRuntime, "sendRawTransaction" | "signAndSend" | "signTransaction">,
): Promise<SendResult> {
  if (options.rpcUrl && runtime.signTransaction && runtime.sendRawTransaction) {
    const signature = runtime.signTransaction(
      walletName,
      "solana",
      Buffer.from(unsignedTransaction.transactionBase64, "base64").toString("hex"),
      passphrase,
      undefined,
      options.vaultPath,
    );
    const signedTransactionBase64 = attachSignatureToTransaction(
      unsignedTransaction.transactionBase64,
      signature.signature,
    );

    return runtime.sendRawTransaction(signedTransactionBase64, options.rpcUrl);
  }

  const txHex = Buffer.from(unsignedTransaction.transactionBase64, "base64").toString("hex");

  return runtime.signAndSend(
    walletName,
    "solana",
    txHex,
    passphrase,
    undefined,
    options.rpcUrl,
    options.vaultPath,
  );
}

function attachSignatureToTransaction(
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

function isBlockhashNotFoundError(error: unknown): boolean {
  if (error instanceof Error) {
    return containsBlockhashNotFound(error.message);
  }

  if (typeof error === "string") {
    return containsBlockhashNotFound(error);
  }

  if (error && typeof error === "object") {
    if ("message" in error && typeof error.message === "string") {
      return containsBlockhashNotFound(error.message);
    }

    try {
      return containsBlockhashNotFound(JSON.stringify(error));
    } catch {
      return false;
    }
  }

  return false;
}

function containsBlockhashNotFound(value: string): boolean {
  return value.includes("BlockhashNotFound") || value.includes("Blockhash not found");
}

function validateTransferOptions(
  options: Pick<PreparedTransferRequestOptions, "amount" | "maxDelayMs" | "minDelayMs" | "split">,
): void {
  if (!Number.isSafeInteger(options.amount) || options.amount < 1) {
    throw new MirageError("Amount must be a positive safe integer.");
  }

  if (options.split !== undefined && (options.split < 1 || options.split > 15)) {
    throw new MirageError("Split must be between 1 and 15.");
  }

  assertDigitString("minDelayMs", options.minDelayMs);
  assertDigitString("maxDelayMs", options.maxDelayMs);
}

function assertDigitString(fieldName: string, value?: string): void {
  if (value !== undefined && !/^\d+$/.test(value)) {
    throw new MirageError(`${fieldName} must contain only digits.`);
  }
}

function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as T;
}
