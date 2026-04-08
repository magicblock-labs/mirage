import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  clearRpcUrl,
  getConfigPath,
  readConfig,
  setRpcUrl,
} from "../dist/lib/config.js";

test("config round-trip uses the shared OWS config file", async () => {
  const sandbox = await mkdtemp(join(tmpdir(), "mirage-config-"));
  const previousHome = process.env.HOME;

  process.env.HOME = sandbox;

  try {
    assert.equal(getConfigPath(), join(sandbox, ".ows", "config.json"));
    assert.deepEqual(await readConfig(), {});

    await setRpcUrl("https://rpc.example.com");

    assert.deepEqual(await readConfig(), {
      rpcUrl: "https://rpc.example.com",
    });

    const written = JSON.parse(await readFile(getConfigPath(), "utf8"));
    assert.equal(written.vault_path, join(sandbox, ".ows"));
    assert.equal(
      written.rpc["solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"],
      "https://rpc.example.com",
    );

    await clearRpcUrl();

    assert.deepEqual(await readConfig(), {});
    const cleared = JSON.parse(await readFile(getConfigPath(), "utf8"));
    assert.equal(cleared.vault_path, join(sandbox, ".ows"));
    assert.equal(cleared.rpc, undefined);
  } finally {
    if (previousHome === undefined) {
      delete process.env.HOME;
    } else {
      process.env.HOME = previousHome;
    }
  }
});
