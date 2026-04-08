import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

import { MirageError } from "./errors.js";

export interface MirageConfig {
  rpcUrl?: string;
}

interface OwsConfigFile {
  backup?: unknown;
  plugins?: unknown;
  rpc?: Record<string, unknown>;
  vault_path?: unknown;
  [key: string]: unknown;
}

const OWS_SOLANA_MAINNET_CHAIN_ID = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp";

export function getConfigDirectory(): string {
  return join(homedir(), ".ows");
}

export function getConfigPath(): string {
  return join(getConfigDirectory(), "config.json");
}

export async function readConfig(): Promise<MirageConfig> {
  const current = await readRawConfig();
  const rpcUrl = normalizeRpcUrl(current.rpc?.[OWS_SOLANA_MAINNET_CHAIN_ID]);
  return rpcUrl ? { rpcUrl } : {};
}

export async function setRpcUrl(rpcUrl: string): Promise<MirageConfig> {
  assertHttpUrl(rpcUrl);
  const current = await readRawConfig();
  const nextRpc = {
    ...getRpcEntries(current.rpc),
    [OWS_SOLANA_MAINNET_CHAIN_ID]: rpcUrl.trim(),
  };

  await writeRawConfig({
    ...current,
    rpc: nextRpc,
    vault_path: normalizeVaultPath(current.vault_path) ?? getConfigDirectory(),
  });

  return {
    rpcUrl: rpcUrl.trim(),
  };
}

export async function clearRpcUrl(): Promise<MirageConfig> {
  const current = await readRawConfig();
  const nextRpc = {
    ...getRpcEntries(current.rpc),
  };

  delete nextRpc[OWS_SOLANA_MAINNET_CHAIN_ID];

  await writeRawConfig({
    ...current,
    rpc: Object.keys(nextRpc).length > 0 ? nextRpc : undefined,
    vault_path: normalizeVaultPath(current.vault_path) ?? getConfigDirectory(),
  });

  return {};
}

export function isHttpUrl(value?: string | null): value is string {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function assertHttpUrl(value: string): void {
  if (!isHttpUrl(value)) {
    throw new MirageError(`Invalid RPC URL "${value}". Expected an http(s) URL.`);
  }
}

async function readRawConfig(): Promise<OwsConfigFile> {
  try {
    const raw = await readFile(getConfigPath(), "utf8");
    return JSON.parse(raw) as OwsConfigFile;
  } catch (error: unknown) {
    if (isMissingFileError(error)) {
      return {};
    }

    throw error;
  }
}

async function writeRawConfig(config: OwsConfigFile): Promise<void> {
  const next = normalizeOwsConfig(config);

  await mkdir(getConfigDirectory(), { recursive: true });
  await writeFile(getConfigPath(), `${JSON.stringify(next, null, 2)}\n`);
}

function normalizeOwsConfig(config: OwsConfigFile): OwsConfigFile {
  const next: OwsConfigFile = {
    ...config,
  };
  const vaultPath = normalizeVaultPath(config.vault_path);
  const rpc = getRpcEntries(config.rpc);

  if (vaultPath) {
    next.vault_path = vaultPath;
  } else {
    delete next.vault_path;
  }

  if (Object.keys(rpc).length > 0) {
    next.rpc = rpc;
  } else {
    delete next.rpc;
  }

  return next;
}

function getRpcEntries(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .map(([key, entry]) => {
        const normalized = normalizeRpcUrl(entry);
        return normalized ? [key, normalized] : undefined;
      })
      .filter((entry): entry is [string, string] => entry !== undefined),
  );
}

function normalizeRpcUrl(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return isHttpUrl(normalized) ? normalized : undefined;
}

function normalizeVaultPath(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized || undefined;
}

function isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
  return (
    error instanceof Error &&
    "code" in error &&
    error.code === "ENOENT"
  );
}
