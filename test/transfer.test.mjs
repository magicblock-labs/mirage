import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import test from "node:test";

import {
  DEFAULT_TRANSFER_MINT,
  DEFAULT_TRANSFER_WALLET,
  executeTransfer,
  resolveTransferNetwork,
} from "../dist/lib/transfer.js";
import {
  DEFAULT_DEVNET_RPC_URL,
  DEFAULT_MAINNET_RPC_URL,
} from "../dist/lib/solana.js";

test("resolveTransferNetwork prefers explicit rpcUrl", () => {
  assert.deepEqual(
    resolveTransferNetwork({
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
    resolveTransferNetwork({
      rpcUrl: "https://rpc.example.com",
    }),
    {
      rpcUrl: "https://rpc.example.com",
    },
  );

  assert.deepEqual(
    resolveTransferNetwork({
      storedRpcUrl: "https://rpc.stored.example.com",
    }),
    {
      rpcUrl: "https://rpc.stored.example.com",
    },
  );

  assert.deepEqual(
    resolveTransferNetwork({
      cluster: "devnet",
    }),
    {
      cluster: "devnet",
      rpcUrl: DEFAULT_DEVNET_RPC_URL,
    },
  );

  assert.deepEqual(
    resolveTransferNetwork({}),
    {},
  );
});

test("executeTransfer builds the API request and signs the returned Solana transaction", async () => {
  const calls = {};
  const txBytes = Buffer.concat([
    Buffer.from([1]),
    Buffer.alloc(64),
    Buffer.from("mirage-solana-transaction", "utf8"),
  ]);
  const signatureBytes = Buffer.alloc(64, 7);
  const signedTxBytes = Buffer.from(txBytes);
  signatureBytes.copy(signedTxBytes, 1);
  const callOrder = [];

  const result = await executeTransfer(
    {
      amount: "0.1",
      cluster: "https://rpc.example.com",
      fromBalance: "base",
      initAtasIfMissing: true,
      initIfMissing: true,
      initVaultIfMissing: true,
      rpcUrl: "https://rpc.example.com",
      to: "To11111111111111111111111111111111111111111",
      toBalance: "base",
      visibility: "private",
      wallet: "agent-treasury",
    },
    {
      buildUnsignedTransfer: async (request) => {
        callOrder.push("buildUnsignedTransfer");
        calls.request = request;

        return {
          instructionCount: 1,
          kind: "transfer",
          lastValidBlockHeight: 1,
          recentBlockhash: "recent-blockhash",
          requiredSigners: ["From111111111111111111111111111111111111111"],
          sendTo: "base",
          transactionBase64: txBytes.toString("base64"),
          validator: "Validator11111111111111111111111111111111111",
          version: "legacy",
        };
      },
      getMintDecimals: async (mint, rpcUrl) => {
        callOrder.push("getMintDecimals");
        calls.getMintDecimals = {
          mint,
          rpcUrl,
        };
        return 6;
      },
      getWallet: () => ({
        accounts: [
          {
            address: "From111111111111111111111111111111111111111",
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
      promptSecret: async () => {
        callOrder.push("promptSecret");
        return undefined;
      },
      runOwsCli: async () => 0,
      sendRawTransaction: async (transactionBase64, rpcUrl) => {
        callOrder.push("sendRawTransaction");
        calls.sendRawTransaction = {
          rpcUrl,
          transactionBase64,
        };

        return {
          txHash: "submitted-signature",
        };
      },
      signAndSend: () => {
        throw new Error("signAndSend should not be used");
      },
      signTransaction: (wallet, chain, txHex, passphrase, index, vaultPath) => {
        callOrder.push("signTransaction");
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

  assert.equal(calls.request.from, "From111111111111111111111111111111111111111");
  assert.equal(calls.request.amount, 100000);
  assert.equal(calls.request.cluster, "https://rpc.example.com");
  assert.deepEqual(calls.getMintDecimals, {
    mint: DEFAULT_TRANSFER_MINT,
    rpcUrl: "https://rpc.example.com",
  });
  assert.equal(calls.request.mint, DEFAULT_TRANSFER_MINT);
  assert.equal(calls.signTransaction.wallet, "agent-treasury");
  assert.equal(calls.signTransaction.chain, "solana");
  assert.equal(calls.signTransaction.txHex, txBytes.toString("hex"));
  assert.equal(calls.sendRawTransaction.rpcUrl, "https://rpc.example.com");
  assert.equal(calls.sendRawTransaction.transactionBase64, signedTxBytes.toString("base64"));
  assert.equal(result.from, "From111111111111111111111111111111111111111");
  assert.equal(result.txHash, "submitted-signature");
  assert.equal(result.rpcUrl, "https://rpc.example.com");
  assert.deepEqual(callOrder, [
    "getMintDecimals",
    "promptSecret",
    "buildUnsignedTransfer",
    "signTransaction",
    "sendRawTransaction",
  ]);
});

test("executeTransfer auto-creates the default wallet before sending when it is missing", async () => {
  const calls = {};

  await executeTransfer(
    {
      amount: "1",
      fromBalance: "base",
      initAtasIfMissing: true,
      initIfMissing: true,
      initVaultIfMissing: true,
      mint: DEFAULT_TRANSFER_MINT,
      to: "To11111111111111111111111111111111111111111",
      toBalance: "base",
      visibility: "private",
    },
    {
      buildUnsignedTransfer: async (request) => {
        calls.request = request;

        return {
          instructionCount: 1,
          kind: "transfer",
          lastValidBlockHeight: 1,
          recentBlockhash: "recent-blockhash",
          requiredSigners: ["From111111111111111111111111111111111111111"],
          sendTo: "base",
          transactionBase64: Buffer.from("tx", "utf8").toString("base64"),
          version: "legacy",
        };
      },
      getMintDecimals: async () => 6,
      getWallet: (wallet) => {
        calls.getWallet = wallet;

        return {
          accounts: [
            {
              address: "From111111111111111111111111111111111111111",
              chainId: "solana:mainnet",
              derivationPath: "m/44'/501'/0'/0'",
            },
          ],
          createdAt: "2026-04-07T00:00:00.000Z",
          id: "wallet-id",
          name: DEFAULT_TRANSFER_WALLET,
        };
      },
      listWallets: () => [],
      promptSecret: async () => undefined,
      runOwsCli: async (args) => {
        calls.runOwsCli = args;
        return 0;
      },
      signAndSend: (wallet) => {
        calls.signAndSendWallet = wallet;
        return { txHash: "submitted-signature" };
      },
    },
  );

  assert.deepEqual(calls.runOwsCli, [
    "wallet",
    "create",
    "--name",
    DEFAULT_TRANSFER_WALLET,
  ]);
  assert.equal(calls.getWallet, DEFAULT_TRANSFER_WALLET);
  assert.equal(calls.signAndSendWallet, DEFAULT_TRANSFER_WALLET);
});

test("executeTransfer rebuilds and retries once when the RPC rejects the blockhash", async () => {
  const calls = {
    buildUnsignedTransfer: [],
    sendRawTransaction: [],
  };
  const firstTxBytes = Buffer.concat([Buffer.from([1]), Buffer.alloc(64), Buffer.from("first-transaction", "utf8")]);
  const secondTxBytes = Buffer.concat([Buffer.from([1]), Buffer.alloc(64), Buffer.from("second-transaction", "utf8")]);

  const result = await executeTransfer(
    {
      amount: "0.1",
      fromBalance: "base",
      initAtasIfMissing: true,
      initIfMissing: true,
      initVaultIfMissing: true,
      rpcUrl: "https://rpc.example.com",
      to: "To11111111111111111111111111111111111111111",
      toBalance: "base",
      visibility: "private",
      wallet: "agent-treasury",
    },
    {
      buildUnsignedTransfer: async () => {
        const callIndex = calls.buildUnsignedTransfer.length;
        calls.buildUnsignedTransfer.push(callIndex);

        return {
          instructionCount: 1,
          kind: "transfer",
          lastValidBlockHeight: callIndex + 1,
          recentBlockhash: `recent-blockhash-${callIndex + 1}`,
          requiredSigners: ["From111111111111111111111111111111111111111"],
          sendTo: "base",
          transactionBase64: (callIndex === 0 ? firstTxBytes : secondTxBytes).toString("base64"),
          version: "legacy",
        };
      },
      getMintDecimals: async () => 6,
      getWallet: () => ({
        accounts: [
          {
            address: "From111111111111111111111111111111111111111",
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
        calls.sendRawTransaction.push({
          rpcUrl,
          transactionBase64,
        });

        if (calls.sendRawTransaction.length === 1) {
          throw new Error('RPC error: {"message":"Transaction simulation failed: Blockhash not found","data":{"err":"BlockhashNotFound"}}');
        }

        return {
          txHash: "submitted-signature",
        };
      },
      signAndSend: () => {
        throw new Error("signAndSend should not be used");
      },
      signTransaction: () => ({
        signature: Buffer.alloc(64, 9).toString("hex"),
      }),
    },
  );

  assert.equal(calls.buildUnsignedTransfer.length, 2);
  assert.deepEqual(
    calls.sendRawTransaction.map((call) => call.transactionBase64),
    [
      Buffer.concat([Buffer.from([1]), Buffer.alloc(64, 9), Buffer.from("first-transaction", "utf8")]).toString("base64"),
      Buffer.concat([Buffer.from([1]), Buffer.alloc(64, 9), Buffer.from("second-transaction", "utf8")]).toString("base64"),
    ],
  );
  assert.equal(result.txHash, "submitted-signature");
  assert.equal(
    result.unsignedTransaction.transactionBase64,
    secondTxBytes.toString("base64"),
  );
});

test("executeTransfer retries when sendRawTransaction throws a string blockhash error", async () => {
  const calls = {
    buildUnsignedTransfer: 0,
    sendRawTransaction: 0,
  };

  await executeTransfer(
    {
      amount: "0.1",
      fromBalance: "base",
      initAtasIfMissing: true,
      initIfMissing: true,
      initVaultIfMissing: true,
      rpcUrl: "https://rpc.example.com",
      to: "To11111111111111111111111111111111111111111",
      toBalance: "base",
      visibility: "private",
      wallet: "agent-treasury",
    },
    {
      buildUnsignedTransfer: async () => {
        calls.buildUnsignedTransfer += 1;

        return {
          instructionCount: 1,
          kind: "transfer",
          lastValidBlockHeight: calls.buildUnsignedTransfer,
          recentBlockhash: `recent-blockhash-${calls.buildUnsignedTransfer}`,
          requiredSigners: ["From111111111111111111111111111111111111111"],
          sendTo: "base",
          transactionBase64: Buffer.concat([
            Buffer.from([1]),
            Buffer.alloc(64),
            Buffer.from(`tx-${calls.buildUnsignedTransfer}`, "utf8"),
          ]).toString("base64"),
          version: "legacy",
        };
      },
      getMintDecimals: async () => 6,
      getWallet: () => ({
        accounts: [
          {
            address: "From111111111111111111111111111111111111111",
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
          throw 'broadcast failed: RPC error: {"message":"Transaction simulation failed: Blockhash not found"}';
        }

        return {
          txHash: "submitted-signature",
        };
      },
      signAndSend: () => {
        throw new Error("signAndSend should not be used");
      },
      signTransaction: () => ({
        signature: Buffer.alloc(64, 3).toString("hex"),
      }),
    },
  );

  assert.equal(calls.buildUnsignedTransfer, 2);
  assert.equal(calls.sendRawTransaction, 2);
});
