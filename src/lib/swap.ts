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
  buildUnsignedSwapTransaction,
  fetchSwapQuote,
  type PaymentsSwapQuoteRequest,
  type PaymentsSwapQuoteResponse,
  type PaymentsSwapRequest,
  type PaymentsSwapResponse,
} from "./payments.js";
import { findSolanaAccount, runOwsCli } from "./ows.js";
import { promptSecret } from "./prompt.js";
import {
  attachSignatureToTransaction,
  convertUiAmountToBaseUnits,
  fetchMintDecimals,
  resolveSolanaRpcUrl,
  sendRawSolanaTransaction,
} from "./solana.js";

export const DEFAULT_SWAP_WALLET = DEFAULT_OWS_WALLET;

export type SwapMode = "ExactIn" | "ExactOut";
export type SwapVisibility = "public" | "private";

export interface SwapNetworkOptions {
  cluster?: string;
  rpcUrl?: string;
  storedRpcUrl?: string;
}

export interface ResolvedSwapNetwork {
  cluster?: string;
  rpcUrl?: string;
}

export interface SwapOptions {
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
  swapMode?: SwapMode;
  trackingAccount?: string;
  useSharedAccounts?: boolean;
  validator?: string;
  vaultPath?: string;
  visibility?: SwapVisibility;
  wallet?: string;
  wrapAndUnwrapSol?: boolean;
}

interface PreparedSwapQuoteRequestOptions {
  amount: string;
  asLegacyTransaction?: boolean;
  dexes?: string;
  dynamicSlippage?: boolean;
  excludeDexes?: string;
  forJitoBundle?: boolean;
  inputMint: string;
  instructionVersion?: "V1" | "V2";
  maxAccounts?: number;
  onlyDirectRoutes?: boolean;
  outputMint: string;
  platformFeeBps?: number;
  restrictIntermediateTokens?: boolean;
  slippageBps?: number;
  supportDynamicIntermediateTokens?: boolean;
  swapMode?: SwapMode;
}

interface PreparedSwapRequestOptions {
  asLegacyTransaction?: boolean;
  blockhashSlotsToExpiry?: number;
  clientRefId?: string;
  computeUnitPriceMicroLamports?: number;
  destination?: string;
  destinationTokenAccount?: string;
  dynamicComputeUnitLimit?: boolean;
  dynamicSlippage?: boolean;
  feeAccount?: string;
  maxDelayMs?: string;
  minDelayMs?: string;
  nativeDestinationAccount?: string;
  payer?: string;
  prioritizationFeeLamports?: number;
  quoteResponse: PaymentsSwapQuoteResponse;
  skipUserAccountsRpcCalls?: boolean;
  split?: number;
  trackingAccount?: string;
  useSharedAccounts?: boolean;
  userPublicKey: string;
  validator?: string;
  visibility: SwapVisibility;
  wrapAndUnwrapSol?: boolean;
}

export interface SwapRuntime extends DefaultWalletRuntime {
  buildUnsignedSwap: (
    request: PaymentsSwapRequest,
    baseUrl?: string,
  ) => Promise<PaymentsSwapResponse>;
  fetchSwapQuote: (
    request: PaymentsSwapQuoteRequest,
    baseUrl?: string,
  ) => Promise<PaymentsSwapQuoteResponse>;
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

export interface SwapResult {
  from: string;
  quote: PaymentsSwapQuoteResponse;
  quoteRequest: PaymentsSwapQuoteRequest;
  request: PaymentsSwapRequest;
  rpcUrl?: string;
  swapTransaction: PaymentsSwapResponse;
  txHash: string;
}

const defaultRuntime: SwapRuntime = {
  buildUnsignedSwap: buildUnsignedSwapTransaction,
  fetchSwapQuote,
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

export function resolveSwapNetwork(
  options: SwapNetworkOptions,
): ResolvedSwapNetwork {
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

export function buildSwapQuoteRequest(
  options: PreparedSwapQuoteRequestOptions,
): PaymentsSwapQuoteRequest {
  validateSwapQuoteOptions(options);

  return stripUndefined({
    amount: options.amount,
    asLegacyTransaction: options.asLegacyTransaction,
    dexes: options.dexes,
    dynamicSlippage: options.dynamicSlippage,
    excludeDexes: options.excludeDexes,
    forJitoBundle: options.forJitoBundle,
    inputMint: options.inputMint,
    instructionVersion: options.instructionVersion,
    maxAccounts: options.maxAccounts,
    onlyDirectRoutes: options.onlyDirectRoutes,
    outputMint: options.outputMint,
    platformFeeBps: options.platformFeeBps,
    restrictIntermediateTokens: options.restrictIntermediateTokens,
    slippageBps: options.slippageBps,
    supportDynamicIntermediateTokens: options.supportDynamicIntermediateTokens,
    swapMode: options.swapMode,
  }) as PaymentsSwapQuoteRequest;
}

export function buildSwapRequest(
  options: PreparedSwapRequestOptions,
): PaymentsSwapRequest {
  validateSwapRequestOptions(options);

  return stripUndefined({
    asLegacyTransaction: options.asLegacyTransaction,
    blockhashSlotsToExpiry: options.blockhashSlotsToExpiry,
    clientRefId: options.clientRefId,
    computeUnitPriceMicroLamports: options.computeUnitPriceMicroLamports,
    destination: options.destination,
    destinationTokenAccount: options.destinationTokenAccount,
    dynamicComputeUnitLimit: options.dynamicComputeUnitLimit,
    dynamicSlippage: options.dynamicSlippage,
    feeAccount: options.feeAccount,
    maxDelayMs: options.maxDelayMs,
    minDelayMs: options.minDelayMs,
    nativeDestinationAccount: options.nativeDestinationAccount,
    payer: options.payer,
    prioritizationFeeLamports: options.prioritizationFeeLamports,
    quoteResponse: options.quoteResponse,
    skipUserAccountsRpcCalls: options.skipUserAccountsRpcCalls,
    split: options.split,
    trackingAccount: options.trackingAccount,
    useSharedAccounts: options.useSharedAccounts,
    userPublicKey: options.userPublicKey,
    validator: options.validator,
    visibility: options.visibility,
    wrapAndUnwrapSol: options.wrapAndUnwrapSol,
  }) as PaymentsSwapRequest;
}

export async function executeSwap(
  options: SwapOptions,
  runtime: SwapRuntime = defaultRuntime,
): Promise<SwapResult> {
  const walletName = await ensureWalletForDefaultBehavior(
    options.wallet ?? DEFAULT_SWAP_WALLET,
    runtime,
  );
  const wallet = runtime.getWallet(walletName, options.vaultPath);
  const from = options.from ?? findSolanaAccount(wallet).address;
  const swapMode = options.swapMode ?? "ExactIn";
  const visibility = options.visibility ?? "public";
  const quoteAmountMint = swapMode === "ExactOut" ? options.outputMint : options.inputMint;
  const broadcastRpcUrl = resolveSolanaRpcUrl(options.cluster, options.rpcUrl);
  const mintDecimals = await runtime.getMintDecimals(quoteAmountMint, broadcastRpcUrl);
  const baseUnitAmount = convertUiAmountToBaseUnits(options.amount, mintDecimals);
  const passphrase = await resolvePassphrase(options.passphrase, runtime);
  const quoteRequest = buildSwapQuoteRequest({
    ...options,
    amount: String(baseUnitAmount),
    swapMode,
  });
  const quote = await runtime.fetchSwapQuote(quoteRequest, options.apiBaseUrl);
  const request = buildSwapRequest({
    ...options,
    quoteResponse: quote,
    userPublicKey: from,
    visibility,
  });
  let swapTransaction = await runtime.buildUnsignedSwap(
    request,
    options.apiBaseUrl,
  );
  let sentTransaction;

  try {
    sentTransaction = await signSwapTransaction(
      walletName,
      swapTransaction,
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

    swapTransaction = await runtime.buildUnsignedSwap(
      request,
      options.apiBaseUrl,
    );
    sentTransaction = await signSwapTransaction(
      walletName,
      swapTransaction,
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
    quote,
    quoteRequest,
    request,
    rpcUrl: options.rpcUrl,
    swapTransaction,
    txHash: sentTransaction.txHash,
  };
}

async function resolvePassphrase(
  cliPassphrase: string | undefined,
  runtime: SwapRuntime,
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

async function signSwapTransaction(
  walletName: string,
  swapTransaction: PaymentsSwapResponse,
  passphrase: string | undefined,
  options: Pick<SwapOptions, "rpcUrl" | "vaultPath">,
  runtime: Pick<SwapRuntime, "sendRawTransaction" | "signAndSend" | "signTransaction">,
): Promise<SendResult> {
  if (options.rpcUrl && runtime.signTransaction && runtime.sendRawTransaction) {
    const signature = runtime.signTransaction(
      walletName,
      "solana",
      Buffer.from(swapTransaction.swapTransaction, "base64").toString("hex"),
      passphrase,
      undefined,
      options.vaultPath,
    );
    const signedTransactionBase64 = attachSignatureToTransaction(
      swapTransaction.swapTransaction,
      signature.signature,
    );

    return runtime.sendRawTransaction(signedTransactionBase64, options.rpcUrl);
  }

  const txHex = Buffer.from(swapTransaction.swapTransaction, "base64").toString("hex");

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

function validateSwapQuoteOptions(
  options: Pick<
    PreparedSwapQuoteRequestOptions,
    "amount" | "maxAccounts" | "platformFeeBps" | "slippageBps"
  >,
): void {
  if (!/^\d+$/.test(options.amount) || BigInt(options.amount) < 1n) {
    throw new MirageError("Amount must be a positive base-unit integer string.");
  }

  assertNonNegativeInteger("slippageBps", options.slippageBps);
  assertNonNegativeInteger("platformFeeBps", options.platformFeeBps);
  assertNonNegativeInteger("maxAccounts", options.maxAccounts);
}

function validateSwapRequestOptions(
  options: Pick<
    PreparedSwapRequestOptions,
    | "asLegacyTransaction"
    | "clientRefId"
    | "computeUnitPriceMicroLamports"
    | "destination"
    | "maxDelayMs"
    | "minDelayMs"
    | "prioritizationFeeLamports"
    | "split"
    | "visibility"
  >,
): void {
  assertNonNegativeInteger("prioritizationFeeLamports", options.prioritizationFeeLamports);
  assertNonNegativeInteger("computeUnitPriceMicroLamports", options.computeUnitPriceMicroLamports);
  assertDigitString("clientRefId", options.clientRefId);

  if (options.visibility !== "private") {
    return;
  }

  if (options.asLegacyTransaction) {
    throw new MirageError("Private swaps do not support asLegacyTransaction.");
  }

  if (!options.destination) {
    throw new MirageError("Private swaps require destination.");
  }

  if (options.minDelayMs === undefined) {
    throw new MirageError("Private swaps require minDelayMs.");
  }

  if (options.maxDelayMs === undefined) {
    throw new MirageError("Private swaps require maxDelayMs.");
  }

  if (options.split === undefined) {
    throw new MirageError("Private swaps require split.");
  }

  assertDigitString("minDelayMs", options.minDelayMs);
  assertDigitString("maxDelayMs", options.maxDelayMs);

  const minDelayMs = Number(options.minDelayMs);
  const maxDelayMs = Number(options.maxDelayMs);

  if (maxDelayMs < minDelayMs) {
    throw new MirageError("maxDelayMs must be greater than or equal to minDelayMs.");
  }

  if (maxDelayMs > 600000) {
    throw new MirageError("maxDelayMs must be less than or equal to 600000.");
  }

  if (!Number.isSafeInteger(options.split) || options.split < 1 || options.split > 14) {
    throw new MirageError("Split must be between 1 and 14.");
  }
}

function assertNonNegativeInteger(fieldName: string, value?: number): void {
  if (value !== undefined && (!Number.isSafeInteger(value) || value < 0)) {
    throw new MirageError(`${fieldName} must be a non-negative safe integer.`);
  }
}

function assertDigitString(fieldName: string, value?: string): void {
  if (value !== undefined && !/^\d+$/.test(value)) {
    throw new MirageError(`${fieldName} must contain only digits.`);
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

function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as T;
}
