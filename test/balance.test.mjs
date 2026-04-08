import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_BALANCE_CHAIN,
  DEFAULT_BALANCE_WALLET,
  executeBalance,
} from "../dist/index.js";

test("executeBalance creates the default wallet before checking balance when missing", async () => {
  const calls = [];

  await executeBalance(
    {},
    {
      listWallets: () => [],
      runOwsCli: async (args) => {
        calls.push(args);
        return 0;
      },
    },
  );

  assert.deepEqual(calls, [
    ["wallet", "create", "--name", DEFAULT_BALANCE_WALLET],
    ["fund", "balance", "--wallet", DEFAULT_BALANCE_WALLET, "--chain", DEFAULT_BALANCE_CHAIN],
  ]);
});

test("executeBalance skips wallet creation when the default wallet already exists", async () => {
  const calls = [];

  await executeBalance(
    {},
    {
      listWallets: () => [
        {
          id: "wallet-id",
          name: DEFAULT_BALANCE_WALLET,
        },
      ],
      runOwsCli: async (args) => {
        calls.push(args);
        return 0;
      },
    },
  );

  assert.deepEqual(calls, [
    ["fund", "balance", "--wallet", DEFAULT_BALANCE_WALLET, "--chain", DEFAULT_BALANCE_CHAIN],
  ]);
});

test("executeBalance uses the requested wallet when provided", async () => {
  const calls = [];

  await executeBalance(
    {
      wallet: "agent-treasury-1",
    },
    {
      listWallets: () => [
        {
          id: "wallet-id",
          name: "agent-treasury-1",
        },
      ],
      runOwsCli: async (args) => {
        calls.push(args);
        return 0;
      },
    },
  );

  assert.deepEqual(calls, [
    ["fund", "balance", "--wallet", "agent-treasury-1", "--chain", DEFAULT_BALANCE_CHAIN],
  ]);
});

test("executeBalance does not auto-create non-default wallets", async () => {
  await assert.rejects(
    () =>
      executeBalance(
        {
          wallet: "missing-wallet",
        },
        {
          listWallets: () => [],
          runOwsCli: async () => 0,
        },
      ),
    /OWS wallet "missing-wallet" was not found/,
  );
});
