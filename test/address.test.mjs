import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_OWS_WALLET,
  executeAddress,
} from "../dist/index.js";

test("executeAddress returns the Solana public key for the requested wallet", async () => {
  const address = await executeAddress(
    {
      wallet: "agent-treasury-1",
    },
    {
      getWallet: () => ({
        accounts: [
          {
            address: "BQaRUAve56ngVYYuTdgPYH9XAFZ9tbnvtNF8YmUQDHiH",
            chainId: "solana:mainnet",
            derivationPath: "m/44'/501'/0'/0'",
          },
        ],
        createdAt: "2026-04-07T00:00:00.000Z",
        id: "wallet-id",
        name: "agent-treasury-1",
      }),
      listWallets: () => [
        {
          id: "wallet-id",
          name: "agent-treasury-1",
        },
      ],
      runOwsCli: async () => 0,
    },
  );

  assert.equal(address, "BQaRUAve56ngVYYuTdgPYH9XAFZ9tbnvtNF8YmUQDHiH");
});

test("executeAddress auto-creates the default wallet before reading its address", async () => {
  const calls = [];

  const address = await executeAddress(
    {},
    {
      getWallet: () => ({
        accounts: [
          {
            address: "HfvHims81Hvtx7HrUx1uEAS37bnT6SjnCzZuScvroxoU",
            chainId: "solana:mainnet",
            derivationPath: "m/44'/501'/0'/0'",
          },
        ],
        createdAt: "2026-04-07T00:00:00.000Z",
        id: "wallet-id",
        name: DEFAULT_OWS_WALLET,
      }),
      listWallets: () => [],
      runOwsCli: async (args) => {
        calls.push(args);
        return 0;
      },
    },
  );

  assert.equal(address, "HfvHims81Hvtx7HrUx1uEAS37bnT6SjnCzZuScvroxoU");
  assert.deepEqual(calls, [["wallet", "create", "--name", DEFAULT_OWS_WALLET]]);
});
