import assert from "node:assert/strict";
import test from "node:test";

import { executeFund, MIRAGE_FUND_BASE_URL } from "../dist/index.js";

test("executeFund opens MagicBlock One with the selected wallet address as rcv", async () => {
  const openedUrls = [];

  const url = await executeFund(
    {
      wallet: "agent-treasury-1",
    },
    {
      addressRuntime: {
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
      openUrl: async (nextUrl) => {
        openedUrls.push(nextUrl);
      },
    },
  );

  const expectedUrl = `${MIRAGE_FUND_BASE_URL}?rcv=BQaRUAve56ngVYYuTdgPYH9XAFZ9tbnvtNF8YmUQDHiH`;

  assert.equal(url, expectedUrl);
  assert.deepEqual(openedUrls, [expectedUrl]);
});
