import anchor, { type Idl } from "@coral-xyz/anchor";
import type {
  BN as BNType,
  Program as ProgramType,
  Wallet as WalletType,
} from "@coral-xyz/anchor";
import {
  convertIdlToCamelCase,
  type IdlField,
  type IdlInstruction,
  type IdlInstructionAccount,
  type IdlInstructionAccountItem,
  type IdlPda,
  type IdlSeed,
  type IdlType,
} from "@coral-xyz/anchor/dist/cjs/idl.js";

const { AnchorProvider, BN, Program, Wallet } = anchor;
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  getWallet as getOwsWallet,
  listWallets,
  signAndSend as owsSignAndSend,
  signTransaction as owsSignTransaction,
  type SendResult,
  type SignResult,
  type WalletInfo,
} from "@open-wallet-standard/core";

import {
  DEFAULT_OWS_WALLET,
  ensureWalletForDefaultBehavior,
  type DefaultWalletRuntime,
} from "./default-wallet.js";
import { MirageError } from "./errors.js";
import { loadIdl, type IdlSource, type LoadedIdl } from "./idl.js";
import { findSolanaAccount, runOwsCli } from "./ows.js";
import {
  promptConfirm,
  promptLine,
  promptMultiSelect,
  promptSecret,
} from "./prompt.js";
import {
  attachSignatureToTransaction,
  resolveSolanaRpcUrl,
  sendRawSolanaTransaction,
} from "./solana.js";

export const DEFAULT_INVOKE_WALLET = DEFAULT_OWS_WALLET;

const WELL_KNOWN_ADDRESSES: Record<string, { address: string; label: string }> = {
  systemProgram: { address: "11111111111111111111111111111111", label: "System Program" },
  system: { address: "11111111111111111111111111111111", label: "System Program" },
  tokenProgram: { address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", label: "SPL Token" },
  token: { address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", label: "SPL Token" },
  token2022Program: { address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb", label: "SPL Token-2022" },
  tokenProgram2022: { address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb", label: "SPL Token-2022" },
  associatedTokenProgram: { address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL", label: "Associated Token Account" },
  computeBudget: { address: "ComputeBudget111111111111111111111111111111", label: "Compute Budget" },
  rent: { address: "SysvarRent111111111111111111111111111111111", label: "Rent Sysvar" },
  clock: { address: "SysvarC1ock11111111111111111111111111111111", label: "Clock Sysvar" },
  instructions: { address: "Sysvar1nstructions1111111111111111111111111", label: "Instructions Sysvar" },
  slotHashes: { address: "SysvarS1otHashes111111111111111111111111111", label: "Slot Hashes Sysvar" },
  stakeHistory: { address: "SysvarStakeHistory1111111111111111111111111", label: "Stake History Sysvar" },
  recentBlockhashes: { address: "SysvarRecentB1ockHashes11111111111111111111", label: "Recent Blockhashes Sysvar" },
};

export interface InvokeOptions {
  programId: string;
  idlPath?: string;
  wallet?: string;
  cluster?: string;
  rpcUrl?: string;
  passphrase?: string;
  vaultPath?: string;
  yes?: boolean;
}

export interface InvokeResultInstruction {
  name: string;
  programId: string;
  accounts: { name: string; pubkey: string; isSigner: boolean; isWritable: boolean }[];
  dataHex: string;
}

export interface InvokeResult {
  from: string;
  programId: string;
  source: IdlSource;
  instructions: InvokeResultInstruction[];
  recentBlockhash: string;
  rpcUrl?: string;
  txHash: string;
}

export interface InvokeRuntime extends DefaultWalletRuntime {
  getWallet: (wallet: string, vaultPath?: string) => WalletInfo;
  loadIdl: typeof loadIdl;
  promptConfirm: typeof promptConfirm;
  promptLine: typeof promptLine;
  promptSecret: typeof promptSecret;
  pickInstructions: (idl: Idl) => Promise<IdlInstruction[]>;
  resolveArgs: (ix: IdlInstruction, idl: Idl) => Promise<Record<string, unknown>>;
  resolveAccounts: (
    ix: IdlInstruction,
    idl: Idl,
    context: AccountResolutionContext,
  ) => Promise<Record<string, PublicKey>>;
  fetchLatestBlockhash: (rpcUrl: string) => Promise<string>;
  sendRawTransaction: (transactionBase64: string, rpcUrl: string) => Promise<SendResult>;
  signTransaction: (
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

export interface AccountResolutionContext {
  signer: PublicKey;
  programId: PublicKey;
  args: Record<string, unknown>;
  resolvedAccounts: Record<string, PublicKey>;
}

const defaultRuntime: InvokeRuntime = {
  fetchLatestBlockhash: (rpcUrl) => fetchLatestBlockhash(rpcUrl),
  getWallet: (wallet, vaultPath) => getOwsWallet(wallet, vaultPath),
  listWallets: () => listWallets(),
  loadIdl,
  pickInstructions: (idl) => pickInstructionsInteractive(idl),
  promptConfirm,
  promptLine,
  promptSecret,
  resolveAccounts: (ix, idl, context) => resolveAccountsInteractive(ix, idl, context),
  resolveArgs: (ix, idl) => resolveArgsInteractive(ix, idl),
  runOwsCli,
  sendRawTransaction: (transactionBase64, rpcUrl) =>
    sendRawSolanaTransaction(transactionBase64, rpcUrl),
  signAndSend: (wallet, chain, txHex, passphrase, index, rpcUrl, vaultPath) =>
    owsSignAndSend(wallet, chain, txHex, passphrase, index, rpcUrl, vaultPath),
  signTransaction: (wallet, chain, txHex, passphrase, index, vaultPath) =>
    owsSignTransaction(wallet, chain, txHex, passphrase, index, vaultPath),
};

export async function executeInvoke(
  options: InvokeOptions,
  runtime: InvokeRuntime = defaultRuntime,
): Promise<InvokeResult> {
  const walletName = await ensureWalletForDefaultBehavior(
    options.wallet ?? DEFAULT_INVOKE_WALLET,
    runtime,
  );
  const wallet = runtime.getWallet(walletName, options.vaultPath);
  const signerAddress = findSolanaAccount(wallet).address;
  const signer = new PublicKey(signerAddress);
  const rpcUrl = resolveSolanaRpcUrl(options.cluster, options.rpcUrl);
  const { idl, source } = await runtime.loadIdl({
    idlPath: options.idlPath,
    programId: options.programId,
    rpcUrl,
  });
  const normalizedIdl = convertIdlToCamelCase(idl);
  const programId = new PublicKey(options.programId);

  console.error(
    `\nProgram: ${normalizedIdl.metadata?.name ?? "<unnamed>"} v${normalizedIdl.metadata?.version ?? "?"}`,
  );
  console.error(`Address: ${programId.toBase58()}`);
  console.error(`IDL:     ${describeSource(source)}`);
  console.error(`Signer:  ${signerAddress} (${walletName})\n`);

  const selected = await runtime.pickInstructions(normalizedIdl);

  if (selected.length === 0) {
    throw new MirageError("No instructions selected; nothing to do.");
  }

  const program = buildAnchorProgram(normalizedIdl, rpcUrl, signer);
  const builtInstructions: TransactionInstruction[] = [];
  const summaries: InvokeResultInstruction[] = [];
  const resolvedAccounts: Record<string, PublicKey> = {};

  for (const ix of selected) {
    console.error(`\n── ${ix.name} ──`);

    const args = await runtime.resolveArgs(ix, normalizedIdl);
    const accounts = await runtime.resolveAccounts(ix, normalizedIdl, {
      args,
      programId,
      resolvedAccounts,
      signer,
    });

    for (const [name, pubkey] of Object.entries(accounts)) {
      resolvedAccounts[name] = pubkey;
    }

    const instruction = await buildInstruction(program, ix, args, accounts);
    builtInstructions.push(instruction);
    summaries.push(summarizeInstruction(ix.name, instruction));
  }

  const recentBlockhash = await runtime.fetchLatestBlockhash(rpcUrl);
  const unsignedTx = buildUnsignedLegacyTx({
    feePayer: signer,
    instructions: builtInstructions,
    recentBlockhash,
  });

  renderTransactionSummary({
    feePayer: signer,
    instructions: summaries,
    recentBlockhash,
    rpcUrl,
    sizeBytes: unsignedTx.length,
  });

  if (!options.yes) {
    const confirmed = await runtime.promptConfirm("Sign and send?", false);

    if (!confirmed) {
      throw new MirageError("Aborted before signing.", 130);
    }
  }

  const passphrase = await resolvePassphrase(options.passphrase, runtime);
  const unsignedBase64 = Buffer.from(unsignedTx).toString("base64");
  const signed = await signAndBroadcast({
    passphrase,
    rpcUrl,
    runtime,
    unsignedBase64,
    vaultPath: options.vaultPath,
    walletName,
  });

  return {
    from: signerAddress,
    instructions: summaries,
    programId: programId.toBase58(),
    recentBlockhash,
    rpcUrl,
    source,
    txHash: signed.txHash,
  };
}

function buildAnchorProgram(idl: Idl, rpcUrl: string, signer: PublicKey): ProgramType {
  const connection = new Connection(rpcUrl, "confirmed");
  const provider = new AnchorProvider(connection, new ReadOnlyWallet(signer), {
    commitment: "confirmed",
  });

  return new Program(idl, provider);
}

async function buildInstruction(
  program: ProgramType,
  ix: IdlInstruction,
  args: Record<string, unknown>,
  accounts: Record<string, PublicKey>,
): Promise<TransactionInstruction> {
  const orderedArgs = ix.args.map((field) => args[field.name]);
  const methods = program.methods as unknown as Record<
    string,
    (...methodArgs: unknown[]) => {
      accountsPartial: (a: Record<string, PublicKey>) => {
        instruction: () => Promise<TransactionInstruction>;
      };
    }
  >;
  const builder = methods[ix.name];

  if (typeof builder !== "function") {
    throw new MirageError(`IDL instruction "${ix.name}" is not present on the Anchor program.`);
  }

  return builder(...orderedArgs).accountsPartial(accounts).instruction();
}

function summarizeInstruction(
  name: string,
  instruction: TransactionInstruction,
): InvokeResultInstruction {
  return {
    accounts: instruction.keys.map((key) => ({
      isSigner: key.isSigner,
      isWritable: key.isWritable,
      name: "",
      pubkey: key.pubkey.toBase58(),
    })),
    dataHex: Buffer.from(instruction.data).toString("hex"),
    name,
    programId: instruction.programId.toBase58(),
  };
}

function buildUnsignedLegacyTx(input: {
  feePayer: PublicKey;
  instructions: TransactionInstruction[];
  recentBlockhash: string;
}): Uint8Array {
  const tx = new Transaction({
    feePayer: input.feePayer,
    recentBlockhash: input.recentBlockhash,
  });
  tx.add(...input.instructions);
  const message = tx.compileMessage().serialize();
  const requiredSignatures = tx.compileMessage().header.numRequiredSignatures;
  const sigCount = encodeShortVec(requiredSignatures);
  const emptySigs = Buffer.alloc(requiredSignatures * 64);

  return Buffer.concat([sigCount, emptySigs, message]);
}

function encodeShortVec(value: number): Buffer {
  const bytes: number[] = [];
  let remaining = value;

  while (true) {
    const byte = remaining & 0x7f;
    remaining >>= 7;

    if (remaining === 0) {
      bytes.push(byte);
      return Buffer.from(bytes);
    }

    bytes.push(byte | 0x80);
  }
}

async function fetchLatestBlockhash(rpcUrl: string): Promise<string> {
  const connection = new Connection(rpcUrl, "confirmed");
  const { blockhash } = await connection.getLatestBlockhash("finalized");

  return blockhash;
}

async function signAndBroadcast(input: {
  passphrase?: string;
  rpcUrl: string;
  runtime: Pick<InvokeRuntime, "sendRawTransaction" | "signAndSend" | "signTransaction">;
  unsignedBase64: string;
  vaultPath?: string;
  walletName: string;
}): Promise<{ txHash: string }> {
  const { passphrase, rpcUrl, runtime, unsignedBase64, vaultPath, walletName } = input;
  const txHex = Buffer.from(unsignedBase64, "base64").toString("hex");

  if (runtime.signTransaction && runtime.sendRawTransaction) {
    const { signature } = runtime.signTransaction(
      walletName,
      "solana",
      txHex,
      passphrase,
      undefined,
      vaultPath,
    );
    const signedBase64 = attachSignatureToTransaction(unsignedBase64, signature);

    return runtime.sendRawTransaction(signedBase64, rpcUrl);
  }

  return runtime.signAndSend(
    walletName,
    "solana",
    txHex,
    passphrase,
    undefined,
    rpcUrl,
    vaultPath,
  );
}

async function resolvePassphrase(
  cliPassphrase: string | undefined,
  runtime: Pick<InvokeRuntime, "promptSecret">,
): Promise<string | undefined> {
  if (typeof cliPassphrase === "string" && cliPassphrase.length > 0) {
    return cliPassphrase;
  }

  const environmentPassphrase = process.env.OWS_PASSPHRASE;

  if (typeof environmentPassphrase === "string" && environmentPassphrase.length > 0) {
    return environmentPassphrase;
  }

  const prompted = await runtime.promptSecret("OWS passphrase (press enter for none): ");
  return prompted || undefined;
}

async function pickInstructionsInteractive(idl: Idl): Promise<IdlInstruction[]> {
  if (idl.instructions.length === 0) {
    throw new MirageError("IDL contains no instructions.");
  }

  const options = idl.instructions.map((ix) => {
    const argNames = ix.args.map((arg) => arg.name).join(", ");
    return {
      hint: argNames ? `(${argNames})` : undefined,
      label: ix.name,
    };
  });

  const indices = await promptMultiSelect(options, {
    prompt: "Pick one or more instructions",
  });

  if (indices !== undefined) {
    return indices
      .map((index) => idl.instructions[index])
      .filter((ix): ix is IdlInstruction => ix !== undefined);
  }

  return pickInstructionsFallback(idl);
}

async function pickInstructionsFallback(idl: Idl): Promise<IdlInstruction[]> {
  console.error("Instructions:");

  idl.instructions.forEach((ix, index) => {
    const argNames = ix.args.map((arg) => arg.name).join(", ");
    console.error(`  ${index + 1}) ${ix.name}${argNames ? ` (${argNames})` : ""}`);
  });

  const answer = await promptLine(
    "\nPick one or more (comma-separated indices, e.g. 1,3; `all` selects every instruction): ",
  );

  if (answer === undefined) {
    throw new MirageError(
      "Cannot pick instructions in a non-interactive terminal. Provide selections programmatically.",
    );
  }

  const trimmed = answer.trim();

  if (trimmed.length === 0) {
    return [];
  }

  if (trimmed.toLowerCase() === "all") {
    return [...idl.instructions];
  }

  const selected: IdlInstruction[] = [];
  const seen = new Set<number>();

  for (const token of trimmed.split(",")) {
    const indexText = token.trim();
    const index = Number.parseInt(indexText, 10);

    if (!Number.isInteger(index) || index < 1 || index > idl.instructions.length) {
      throw new MirageError(`Invalid instruction selection: "${indexText}".`);
    }

    if (seen.has(index)) {
      continue;
    }

    seen.add(index);
    const ix = idl.instructions[index - 1];
    if (ix) {
      selected.push(ix);
    }
  }

  return selected;
}

async function resolveArgsInteractive(
  ix: IdlInstruction,
  idl: Idl,
): Promise<Record<string, unknown>> {
  const args: Record<string, unknown> = {};

  for (const field of ix.args) {
    args[field.name] = await resolveArg(field, idl, `${ix.name}.${field.name}`);
  }

  return args;
}

async function resolveArg(
  field: IdlField,
  idl: Idl,
  label: string,
): Promise<unknown> {
  const hint = describeIdlType(field.type);
  const answer = await promptLine(`${label} (${hint}): `);

  if (answer === undefined) {
    throw new MirageError(
      `Cannot prompt for argument "${label}" without an interactive terminal.`,
    );
  }

  return coerceArgument(field.type, answer.trim(), label, idl);
}

function describeIdlType(type: IdlType): string {
  if (typeof type === "string") {
    return type;
  }

  if ("option" in type) {
    return `Option<${describeIdlType(type.option)}>`;
  }

  if ("coption" in type) {
    return `COption<${describeIdlType(type.coption)}>`;
  }

  if ("vec" in type) {
    return `Vec<${describeIdlType(type.vec)}>`;
  }

  if ("array" in type) {
    const [inner, len] = type.array;
    return `[${describeIdlType(inner)}; ${typeof len === "number" ? len : `const ${len.generic}`}]`;
  }

  if ("defined" in type) {
    return type.defined.name;
  }

  if ("generic" in type) {
    return `<${type.generic}>`;
  }

  return "unknown";
}

export function coerceArgument(
  type: IdlType,
  raw: string,
  label: string,
  idl: Idl,
): unknown {
  if (typeof type === "string") {
    return coerceScalar(type, raw, label);
  }

  if ("option" in type) {
    if (raw === "" || raw.toLowerCase() === "null" || raw.toLowerCase() === "none") {
      return null;
    }
    return coerceArgument(type.option, raw, label, idl);
  }

  if ("coption" in type) {
    if (raw === "" || raw.toLowerCase() === "null") {
      return null;
    }
    return coerceArgument(type.coption, raw, label, idl);
  }

  if ("vec" in type || "array" in type || "defined" in type) {
    if (raw === "") {
      throw new MirageError(
        `Argument "${label}" of type ${describeIdlType(type)} requires a JSON value (e.g. [1,2,3]).`,
      );
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      throw new MirageError(
        `Argument "${label}" could not be parsed as JSON: ${(error as Error).message ?? error}`,
      );
    }

    return parsed;
  }

  throw new MirageError(`Unsupported IDL type for "${label}": ${JSON.stringify(type)}`);
}

function coerceScalar(type: string, raw: string, label: string): unknown {
  switch (type) {
    case "bool":
      if (raw === "true" || raw === "1" || raw === "yes" || raw === "y") return true;
      if (raw === "false" || raw === "0" || raw === "no" || raw === "n" || raw === "") return false;
      throw new MirageError(`Argument "${label}" must be a boolean; got "${raw}".`);
    case "u8":
    case "u16":
    case "u32":
    case "i8":
    case "i16":
    case "i32":
    case "f32":
    case "f64": {
      const n = Number(raw);
      if (!Number.isFinite(n)) {
        throw new MirageError(`Argument "${label}" must be a number; got "${raw}".`);
      }
      return n;
    }
    case "u64":
    case "i64":
    case "u128":
    case "i128":
    case "u256":
    case "i256":
      try {
        return new BN(raw);
      } catch {
        throw new MirageError(`Argument "${label}" must be an integer string for ${type}.`);
      }
    case "string":
      return raw;
    case "pubkey":
    case "publicKey":
      try {
        return new PublicKey(raw);
      } catch {
        throw new MirageError(`Argument "${label}" must be a Solana address; got "${raw}".`);
      }
    case "bytes":
      return parseBytes(raw, label);
    default:
      throw new MirageError(`Unsupported scalar IDL type for "${label}": ${type}`);
  }
}

function parseBytes(raw: string, label: string): Buffer {
  const trimmed = raw.trim();

  if (trimmed.startsWith("0x") || trimmed.startsWith("0X")) {
    const hex = trimmed.slice(2);

    if (!/^[0-9a-fA-F]*$/.test(hex) || hex.length % 2 !== 0) {
      throw new MirageError(`Argument "${label}" is not a valid hex byte string.`);
    }

    return Buffer.from(hex, "hex");
  }

  try {
    const parsed = JSON.parse(trimmed);

    if (!Array.isArray(parsed) || !parsed.every((byte) => Number.isInteger(byte) && byte >= 0 && byte <= 255)) {
      throw new Error();
    }

    return Buffer.from(parsed);
  } catch {
    throw new MirageError(
      `Argument "${label}" must be a hex string (0x...) or a JSON array of bytes.`,
    );
  }
}

async function resolveAccountsInteractive(
  ix: IdlInstruction,
  idl: Idl,
  context: AccountResolutionContext,
): Promise<Record<string, PublicKey>> {
  const resolved: Record<string, PublicKey> = {};
  const flatAccounts = flattenAccounts(ix.accounts);

  for (const account of flatAccounts) {
    const { name } = account;
    const pubkey = await resolveAccount(account, context, resolved);
    resolved[name] = pubkey;

    const source = pickAccountSource(account, context, pubkey);
    console.error(`  ${formatAccountName(account)}: ${pubkey.toBase58()} ${source}`);
  }

  return resolved;
}

function flattenAccounts(
  items: IdlInstructionAccountItem[],
): IdlInstructionAccount[] {
  const flat: IdlInstructionAccount[] = [];

  for (const item of items) {
    if ("accounts" in item) {
      for (const nested of item.accounts) {
        flat.push(nested);
      }
    } else {
      flat.push(item);
    }
  }

  return flat;
}

async function resolveAccount(
  account: IdlInstructionAccount,
  context: AccountResolutionContext,
  resolvedSoFar: Record<string, PublicKey>,
): Promise<PublicKey> {
  if (account.signer && account.writable !== false) {
    return context.signer;
  }

  if (account.signer) {
    return context.signer;
  }

  if (account.address) {
    return new PublicKey(account.address);
  }

  const known = WELL_KNOWN_ADDRESSES[account.name];

  if (known) {
    return new PublicKey(known.address);
  }

  if (account.pda) {
    const derived = derivePdaFromMetadata(account.pda, {
      ...context,
      resolvedAccounts: { ...context.resolvedAccounts, ...resolvedSoFar },
    });

    if (derived) {
      return derived;
    }
  }

  return promptForAccount(account);
}

export function derivePdaFromMetadata(
  pda: IdlPda,
  context: AccountResolutionContext,
): PublicKey | null {
  const seedBuffers: Buffer[] = [];

  for (const seed of pda.seeds) {
    const bytes = evaluateSeed(seed, context);

    if (!bytes) {
      return null;
    }

    seedBuffers.push(bytes);
  }

  const programId = pda.program
    ? evaluateSeedAsPubkey(pda.program, context)
    : context.programId;

  if (!programId) {
    return null;
  }

  const [address] = PublicKey.findProgramAddressSync(seedBuffers, programId);
  return address;
}

function evaluateSeed(seed: IdlSeed, context: AccountResolutionContext): Buffer | null {
  if (seed.kind === "const") {
    return Buffer.from(seed.value);
  }

  if (seed.kind === "arg") {
    const value = context.args[seed.path];
    return value === undefined ? null : coerceSeedValue(value);
  }

  if (seed.kind === "account") {
    const accountName = seed.path.split(".")[0];
    if (!accountName) return null;
    const pubkey = context.resolvedAccounts[accountName];

    if (!pubkey) return null;

    if (!seed.path.includes(".")) {
      return pubkey.toBuffer();
    }

    return null;
  }

  return null;
}

function evaluateSeedAsPubkey(
  seed: IdlSeed,
  context: AccountResolutionContext,
): PublicKey | null {
  const buffer = evaluateSeed(seed, context);

  if (!buffer || buffer.length !== 32) {
    return null;
  }

  return new PublicKey(buffer);
}

function coerceSeedValue(value: unknown): Buffer | null {
  if (typeof value === "string") {
    try {
      return new PublicKey(value).toBuffer();
    } catch {
      return Buffer.from(value, "utf8");
    }
  }

  if (value instanceof PublicKey) {
    return value.toBuffer();
  }

  if (value instanceof BN) {
    return (value as BNType).toArrayLike(Buffer, "le", 8);
  }

  if (Buffer.isBuffer(value)) {
    return value;
  }

  if (typeof value === "number" && Number.isInteger(value)) {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(BigInt(value));
    return buf;
  }

  if (typeof value === "boolean") {
    return Buffer.from([value ? 1 : 0]);
  }

  return null;
}

async function promptForAccount(account: IdlInstructionAccount): Promise<PublicKey> {
  const flags: string[] = [];
  if (account.writable) flags.push("writable");
  if (account.signer) flags.push("signer");
  if (account.optional) flags.push("optional");

  const suffix = flags.length > 0 ? ` [${flags.join(", ")}]` : "";
  const answer = await promptLine(`  ${account.name}${suffix} address: `);

  if (answer === undefined) {
    throw new MirageError(
      `Cannot prompt for account "${account.name}" without an interactive terminal.`,
    );
  }

  try {
    return new PublicKey(answer.trim());
  } catch {
    throw new MirageError(`Account "${account.name}" has an invalid address: ${answer}`);
  }
}

function pickAccountSource(
  account: IdlInstructionAccount,
  context: AccountResolutionContext,
  pubkey: PublicKey,
): string {
  if (pubkey.equals(context.signer)) {
    return "(signer)";
  }

  if (account.address && account.address === pubkey.toBase58()) {
    return "(IDL address)";
  }

  const known = WELL_KNOWN_ADDRESSES[account.name];

  if (known && known.address === pubkey.toBase58()) {
    return `(${known.label})`;
  }

  if (account.pda) {
    return "(auto-derived PDA)";
  }

  return "(user-provided)";
}

function formatAccountName(account: IdlInstructionAccount): string {
  const flags: string[] = [];
  if (account.writable) flags.push("w");
  if (account.signer) flags.push("s");
  const marker = flags.length > 0 ? `[${flags.join("")}]` : "   ";
  return `${marker} ${account.name}`;
}

function renderTransactionSummary(input: {
  feePayer: PublicKey;
  instructions: InvokeResultInstruction[];
  recentBlockhash: string;
  rpcUrl: string;
  sizeBytes: number;
}): void {
  console.error("\n── Transaction summary ──");
  console.error(`Fee payer:   ${input.feePayer.toBase58()}`);
  console.error(`Blockhash:   ${input.recentBlockhash}`);
  console.error(`RPC:         ${input.rpcUrl}`);
  console.error(`Instructions: ${input.instructions.length}`);
  console.error(`Size:        ${input.sizeBytes} bytes`);

  input.instructions.forEach((ix, idx) => {
    console.error(`  ${idx + 1}. ${ix.name}  ->  ${ix.programId}  (data: ${ix.dataHex.length / 2} B)`);
  });
}

function describeSource(source: IdlSource): string {
  return source.kind === "file"
    ? `file (${source.location})`
    : `on-chain (${source.location})`;
}

class ReadOnlyWallet implements WalletType {
  readonly payer: Keypair = Keypair.generate();

  constructor(readonly publicKey: PublicKey) {}

  async signTransaction<T>(_tx: T): Promise<T> {
    throw new MirageError("Read-only wallet cannot sign transactions.");
  }

  async signAllTransactions<T>(_txs: T[]): Promise<T[]> {
    throw new MirageError("Read-only wallet cannot sign transactions.");
  }
}
