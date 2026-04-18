import { readFile } from "node:fs/promises";

import anchor, { type Idl } from "@coral-xyz/anchor";
import type { AnchorProvider as AnchorProviderType } from "@coral-xyz/anchor";

const { AnchorProvider, Program, Wallet } = anchor;
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

import { MirageError } from "./errors.js";

export interface IdlSource {
  kind: "on-chain" | "file";
  location: string;
}

export interface LoadedIdl {
  idl: Idl;
  source: IdlSource;
}

export interface LoadIdlOptions {
  programId: string;
  idlPath?: string;
  rpcUrl: string;
}

export async function loadIdl(options: LoadIdlOptions): Promise<LoadedIdl> {
  const programId = parseProgramId(options.programId);

  if (options.idlPath) {
    const idl = await loadIdlFromFile(options.idlPath);

    return {
      idl: reconcileProgramAddress(idl, programId.toBase58()),
      source: { kind: "file", location: options.idlPath },
    };
  }

  const idl = await fetchIdlFromChain(programId, options.rpcUrl);

  if (!idl) {
    throw new MirageError(
      `No Anchor IDL is published on-chain for ${programId.toBase58()}. Provide one with --idl <path>.`,
    );
  }

  return {
    idl: reconcileProgramAddress(idl, programId.toBase58()),
    source: { kind: "on-chain", location: programId.toBase58() },
  };
}

async function loadIdlFromFile(path: string): Promise<Idl> {
  let contents: string;

  try {
    contents = await readFile(path, "utf8");
  } catch (error) {
    throw new MirageError(
      `Failed to read IDL file at ${path}: ${(error as Error).message ?? error}`,
    );
  }

  try {
    return JSON.parse(contents) as Idl;
  } catch (error) {
    throw new MirageError(
      `IDL file at ${path} is not valid JSON: ${(error as Error).message ?? error}`,
    );
  }
}

async function fetchIdlFromChain(
  programId: PublicKey,
  rpcUrl: string,
): Promise<Idl | null> {
  const connection = new Connection(rpcUrl, "confirmed");
  const provider = buildReadOnlyProvider(connection);

  try {
    return await Program.fetchIdl<Idl>(programId, provider);
  } catch (error) {
    throw new MirageError(
      `Failed to fetch on-chain IDL for ${programId.toBase58()}: ${(error as Error).message ?? error}`,
    );
  }
}

function buildReadOnlyProvider(connection: Connection): AnchorProviderType {
  return new AnchorProvider(connection, new Wallet(Keypair.generate()), {
    commitment: "confirmed",
  });
}

function reconcileProgramAddress(idl: Idl, programId: string): Idl {
  if (idl.address && idl.address !== programId) {
    console.error(
      `Warning: IDL declares address ${idl.address} but you invoked ${programId}. Using the invoked address.`,
    );
  }

  return { ...idl, address: programId };
}

function parseProgramId(raw: string): PublicKey {
  try {
    return new PublicKey(raw);
  } catch {
    throw new MirageError(`Invalid program ID: ${raw}`);
  }
}
