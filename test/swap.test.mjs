import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import test from "node:test";

import {
  buildSwapRequest,
  DEFAULT_SWAP_WALLET,
  executeSwap,
  resolveSwapNetwork,
} from "../dist/lib/swap.js";
import {
  DEFAULT_DEVNET_RPC_URL,
} from "../dist/lib/solana.js";

const INPUT_MINT = "InputMint1111111111111111111111111111111111111";
const OUTPUT_MINT = "OutputMint111111111111111111111111111111111111";
const FROM = "From111111111111111111111111111111111111111";

test("resolveSwapNetwork prefers explicit rpcUrl", () => {
  assert.deepEqual(
    resolveSwapNetwork({
      cluster: "mainnet",
      rpcUrl: "https://rpc.example.com",
      storedRpcUrl: "https://rpc.stored.example.com",
    }),
    {
      cluster: "mainnet",
      rpcUrl: "https://rpc.example.com",
    },
  );

  assert.deepEqual(
    resolveSwapNetwork({
      storedRpcUrl: "https://rpc.stored.example.com",
    }),
    {
      rpcUrl: "https://rpc.stored.example.com",
    },
  );

  assert.deepEqual(
    resolveSwapNetwork({
      cluster: "devnet",
    }),
    {
      cluster: "devnet",
      rpcUrl: DEFAULT_DEVNET_RPC_URL,
    },
  );
});

test("executeSwap fetches a quote, builds the swap request, and signs the transaction", async () => {
  const calls = {};
  const txBytes = Buffer.concat([
    Buffer.from([1]),
    Buffer.alloc(64),
    Buffer.from("mirage-swap-transaction", "utf8"),
  ]);
  const signatureBytes = Buffer.alloc(64, 5);
  const signedTxBytes = Buffer.from(txBytes);
  signatureBytes.copy(signedTxBytes, 1);
  const quote = buildQuote();

  const result = await executeSwap(
    {
      amount: "0.1",
      clientRefId: "42",
      destination: "Destination111111111111111111111111111111111",
      inputMint: INPUT_MINT,
      maxDelayMs: "60000",
      minDelayMs: "0",
      outputMint: OUTPUT_MINT,
      rpcUrl: "https://rpc.example.com",
      slippageBps: 50,
      split: 1,
      validator: "Validator11111111111111111111111111111111111",
      visibility: "private",
      wallet: "agent-treasury",
      wrapAndUnwrapSol: true,
    },
    {
      buildUnsignedSwap: async (request) => {
        calls.swapRequest = request;

        return {
          lastValidBlockHeight: 1,
          privateTransfer: {
            hydraCrankPda: "Hydra1111111111111111111111111111111111111",
            shuttleId: 7,
            stashAta: "Stash111111111111111111111111111111111111",
          },
          swapTransaction: txBytes.toString("base64"),
        };
      },
      fetchSwapQuote: async (request) => {
        calls.quoteRequest = request;
        return quote;
      },
      getMintDecimals: async (mint, rpcUrl) => {
        calls.getMintDecimals = {
          mint,
          rpcUrl,
        };
        return 6;
      },
      getWallet: () => ({
        accounts: [
          {
            address: FROM,
            chainId: "solana:mainnet",
            derivationPath: "m/44'/501'/0'/0'",
          },
        ],
        createdAt: "2026-04-07T00:00:00.000Z",
        id: "wallet-id",
        name: "agent-treasury",
      }),
      listWallets: () => [
        {
          id: "wallet-id",
          name: "agent-treasury",
        },
      ],
      promptSecret: async () => undefined,
      runOwsCli: async () => 0,
      sendRawTransaction: async (transactionBase64, rpcUrl) => {
        calls.sendRawTransaction = {
          rpcUrl,
          transactionBase64,
        };

        return {
          txHash: "submitted-swap-signature",
        };
      },
      signAndSend: () => {
        throw new Error("signAndSend should not be used");
      },
      signTransaction: (wallet, chain, txHex, passphrase, index, vaultPath) => {
        calls.signTransaction = {
          chain,
          index,
          passphrase,
          txHex,
          vaultPath,
          wallet,
        };
        return {
          signature: signatureBytes.toString("hex"),
        };
      },
    },
  );

  assert.deepEqual(calls.getMintDecimals, {
    mint: INPUT_MINT,
    rpcUrl: "https://rpc.example.com",
  });
  assert.deepEqual(calls.quoteRequest, {
    amount: "100000",
    inputMint: INPUT_MINT,
    outputMint: OUTPUT_MINT,
    slippageBps: 50,
    swapMode: "ExactIn",
  });
  assert.equal(calls.swapRequest.userPublicKey, FROM);
  assert.equal(calls.swapRequest.quoteResponse, quote);
  assert.equal(calls.swapRequest.visibility, "private");
  assert.equal(calls.swapRequest.destination, "Destination111111111111111111111111111111111");
  assert.equal(calls.swapRequest.minDelayMs, "0");
  assert.equal(calls.swapRequest.maxDelayMs, "60000");
  assert.equal(calls.swapRequest.split, 1);
  assert.equal(calls.swapRequest.clientRefId, "42");
  assert.equal(calls.swapRequest.wrapAndUnwrapSol, true);
  assert.equal(calls.signTransaction.wallet, "agent-treasury");
  assert.equal(calls.signTransaction.chain, "solana");
  assert.equal(calls.signTransaction.txHex, txBytes.toString("hex"));
  assert.deepEqual(calls.sendRawTransaction, {
    rpcUrl: "https://rpc.example.com",
    transactionBase64: signedTxBytes.toString("base64"),
  });
  assert.equal(result.from, FROM);
  assert.equal(result.txHash, "submitted-swap-signature");
  assert.equal(result.rpcUrl, "https://rpc.example.com");
});

test("executeSwap converts ExactOut UI amount using output mint decimals", async () => {
  const calls = {};

  await executeSwap(
    {
      amount: "1.23",
      inputMint: INPUT_MINT,
      outputMint: OUTPUT_MINT,
      swapMode: "ExactOut",
    },
    {
      buildUnsignedSwap: async () => ({
        swapTransaction: Buffer.from("tx", "utf8").toString("base64"),
      }),
      fetchSwapQuote: async (request) => {
        calls.quoteRequest = request;
        return buildQuote({
          inAmount: "456",
          outAmount: "123",
          swapMode: "ExactOut",
        });
      },
      getMintDecimals: async (mint) => {
        calls.decimalMint = mint;
        return 2;
      },
      getWallet: () => ({
        accounts: [
          {
            address: FROM,
            chainId: "solana:mainnet",
            derivationPath: "m/44'/501'/0'/0'",
          },
        ],
        createdAt: "2026-04-07T00:00:00.000Z",
        id: "wallet-id",
        name: DEFAULT_SWAP_WALLET,
      }),
      listWallets: () => [
        {
          id: "wallet-id",
          name: DEFAULT_SWAP_WALLET,
        },
      ],
      promptSecret: async () => undefined,
      runOwsCli: async () => 0,
      signAndSend: () => ({
        txHash: "submitted-swap-signature",
      }),
    },
  );

  assert.equal(calls.decimalMint, OUTPUT_MINT);
  assert.equal(calls.quoteRequest.amount, "123");
  assert.equal(calls.quoteRequest.swapMode, "ExactOut");
});

test("executeSwap rebuilds and retries once when the RPC rejects the blockhash", async () => {
  const calls = {
    buildUnsignedSwap: 0,
    sendRawTransaction: 0,
  };

  await executeSwap(
    {
      amount: "1",
      inputMint: INPUT_MINT,
      outputMint: OUTPUT_MINT,
      rpcUrl: "https://rpc.example.com",
      wallet: "agent-treasury",
    },
    {
      buildUnsignedSwap: async () => {
        calls.buildUnsignedSwap += 1;

        return {
          lastValidBlockHeight: calls.buildUnsignedSwap,
          swapTransaction: Buffer.concat([
            Buffer.from([1]),
            Buffer.alloc(64),
            Buffer.from(`tx-${calls.buildUnsignedSwap}`, "utf8"),
          ]).toString("base64"),
        };
      },
      fetchSwapQuote: async () => buildQuote(),
      getMintDecimals: async () => 6,
      getWallet: () => ({
        accounts: [
          {
            address: FROM,
            chainId: "solana:mainnet",
            derivationPath: "m/44'/501'/0'/0'",
          },
        ],
        createdAt: "2026-04-07T00:00:00.000Z",
        id: "wallet-id",
        name: "agent-treasury",
      }),
      listWallets: () => [
        {
          id: "wallet-id",
          name: "agent-treasury",
        },
      ],
      promptSecret: async () => undefined,
      runOwsCli: async () => 0,
      sendRawTransaction: async () => {
        calls.sendRawTransaction += 1;

        if (calls.sendRawTransaction === 1) {
          throw new Error('RPC error: {"message":"Transaction simulation failed: Blockhash not found"}');
        }

        return {
          txHash: "submitted-swap-signature",
        };
      },
      signAndSend: () => {
        throw new Error("signAndSend should not be used");
      },
      signTransaction: () => ({
        signature: Buffer.alloc(64, 4).toString("hex"),
      }),
    },
  );

  assert.equal(calls.buildUnsignedSwap, 2);
  assert.equal(calls.sendRawTransaction, 2);
});

test("executeSwap validates private swap options before external calls", async () => {
  const calls = {
    fetchSwapQuote: 0,
    getMintDecimals: 0,
    listWallets: 0,
    promptSecret: 0,
  };

  await assert.rejects(
    () =>
      executeSwap(
        {
          amount: "1",
          inputMint: INPUT_MINT,
          outputMint: OUTPUT_MINT,
          visibility: "private",
        },
        {
          buildUnsignedSwap: async () => {
            throw new Error("buildUnsignedSwap should not be used");
          },
          fetchSwapQuote: async () => {
            calls.fetchSwapQuote += 1;
            throw new Error("fetchSwapQuote should not be used");
          },
          getMintDecimals: async () => {
            calls.getMintDecimals += 1;
            throw new Error("getMintDecimals should not be used");
          },
          getWallet: () => {
            throw new Error("getWallet should not be used");
          },
          listWallets: () => {
            calls.listWallets += 1;
            return [];
          },
          promptSecret: async () => {
            calls.promptSecret += 1;
            return undefined;
          },
          runOwsCli: async () => {
            throw new Error("runOwsCli should not be used");
          },
          signAndSend: () => {
            throw new Error("signAndSend should not be used");
          },
        },
      ),
    /Private swaps require destination/,
  );

  assert.deepEqual(calls, {
    fetchSwapQuote: 0,
    getMintDecimals: 0,
    listWallets: 0,
    promptSecret: 0,
  });
});

test("buildSwapRequest requires private swap delivery fields", () => {
  assert.throws(
    () =>
      buildSwapRequest({
        quoteResponse: buildQuote(),
        userPublicKey: FROM,
        visibility: "private",
      }),
    /Private swaps require destination/,
  );
});

function buildQuote(overrides = {}) {
  return {
    inputMint: INPUT_MINT,
    inAmount: "100000",
    outputMint: OUTPUT_MINT,
    outAmount: "999",
    otherAmountThreshold: "990",
    priceImpactPct: "0",
    routePlan: [],
    slippageBps: 50,
    swapMode: "ExactIn",
    ...overrides,
  };
}
