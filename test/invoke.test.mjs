import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import test from "node:test";

import anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

import {
  coerceArgument,
  derivePdaFromMetadata,
  executeInvoke,
  inspectIdl,
} from "../dist/lib/invoke.js";

const { BN } = anchor;

const PROGRAM_ID = "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin";
const SIGNER_ADDRESS = "BWXkMkF96qe28cPGqkbCRfrAyZUd2vxmt8u4XnKr3eHk";

const COUNTER_IDL = {
  address: PROGRAM_ID,
  metadata: {
    name: "counter",
    spec: "0.1.0",
    version: "0.1.0",
  },
  instructions: [
    {
      name: "initialize",
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237],
      accounts: [
        {
          name: "counter",
          writable: true,
          pda: {
            seeds: [
              { kind: "const", value: [99, 111, 117, 110, 116, 101, 114] },
              { kind: "account", path: "authority" },
            ],
          },
        },
        { name: "authority", writable: true, signer: true },
        { name: "systemProgram", address: "11111111111111111111111111111111" },
      ],
      args: [{ name: "start", type: "u64" }],
    },
  ],
};

test("coerceArgument handles common scalar types", () => {
  assert.equal(coerceArgument("bool", "true", "x", COUNTER_IDL), true);
  assert.equal(coerceArgument("bool", "false", "x", COUNTER_IDL), false);
  assert.equal(coerceArgument("bool", "y", "x", COUNTER_IDL), true);
  assert.equal(coerceArgument("u32", "42", "x", COUNTER_IDL), 42);
  assert.equal(coerceArgument("string", "hello", "x", COUNTER_IDL), "hello");

  const big = coerceArgument("u64", "18446744073709551615", "x", COUNTER_IDL);
  assert.equal(big.toString(), "18446744073709551615");

  const pk = coerceArgument("pubkey", SIGNER_ADDRESS, "x", COUNTER_IDL);
  assert.ok(pk instanceof PublicKey);
  assert.equal(pk.toBase58(), SIGNER_ADDRESS);
});

test("coerceArgument rejects malformed inputs", () => {
  assert.throws(() => coerceArgument("u32", "not-a-number", "x", COUNTER_IDL), /must be a number/);
  assert.throws(() => coerceArgument("pubkey", "nope", "x", COUNTER_IDL), /Solana address/);
  assert.throws(() => coerceArgument("bool", "maybe", "x", COUNTER_IDL), /must be a boolean/);
});

test("coerceArgument coerces option payloads and recognises null", () => {
  assert.equal(coerceArgument({ option: "u32" }, "", "x", COUNTER_IDL), null);
  assert.equal(coerceArgument({ option: "u32" }, "null", "x", COUNTER_IDL), null);
  assert.equal(coerceArgument({ option: "u32" }, "7", "x", COUNTER_IDL), 7);
});

test("derivePdaFromMetadata derives a PDA from const + account seeds", () => {
  const programId = new PublicKey(PROGRAM_ID);
  const signer = new PublicKey(SIGNER_ADDRESS);
  const pda = derivePdaFromMetadata(COUNTER_IDL.instructions[0].accounts[0].pda, {
    args: { start: 1n },
    programId,
    resolvedAccounts: { authority: signer },
    signer,
  });

  assert.ok(pda instanceof PublicKey);

  const expected = PublicKey.findProgramAddressSync(
    [Buffer.from("counter"), signer.toBuffer()],
    programId,
  )[0];

  assert.equal(pda.toBase58(), expected.toBase58());
});

test("executeInvoke walks the IDL, builds the tx, and routes signing through OWS", async () => {
  const calls = {};
  const txBytes = Buffer.alloc(96, 0);
  txBytes[0] = 1;
  const signatureHex = Buffer.alloc(64, 7).toString("hex");
  const signedTxBytes = Buffer.from(txBytes);
  Buffer.from(signatureHex, "hex").copy(signedTxBytes, 1);

  const result = await executeInvoke(
    {
      programId: PROGRAM_ID,
      rpcUrl: "https://rpc.example.com",
      wallet: "agent-treasury",
      yes: true,
    },
    {
      fetchLatestBlockhash: async (rpcUrl) => {
        calls.fetchLatestBlockhashRpcUrl = rpcUrl;
        return "EkSnNWid2cvwEVnVx9aBqawnmiCNiDgp3gUdkDPTKN1N";
      },
      getWallet: () => ({
        accounts: [
          {
            address: SIGNER_ADDRESS,
            chainId: "solana:mainnet",
            derivationPath: "m/44'/501'/0'/0'",
          },
        ],
        createdAt: "2026-04-07T00:00:00.000Z",
        id: "wallet-id",
        name: "agent-treasury",
      }),
      listWallets: () => [{ id: "wallet-id", name: "agent-treasury" }],
      loadIdl: async ({ programId, rpcUrl }) => {
        calls.loadIdl = { programId, rpcUrl };
        return { idl: COUNTER_IDL, source: { kind: "on-chain", location: programId } };
      },
      pickInstructions: async (idl) => {
        calls.pickInstructionsCount = idl.instructions.length;
        return [idl.instructions[0]];
      },
      promptConfirm: async () => true,
      promptLine: async () => undefined,
      promptSecret: async () => undefined,
      resolveArgs: async (ix) => {
        calls.resolveArgs = ix.name;
        return { start: new BN(7) };
      },
      resolveAccounts: async (ix, _idl, context) => {
        calls.resolveAccountsCount = ix.accounts.length;
        return {
          authority: context.signer,
          counter: new PublicKey("Counter111111111111111111111111111111111111"),
          systemProgram: new PublicKey("11111111111111111111111111111111"),
        };
      },
      runOwsCli: async () => 0,
      sendRawTransaction: async (transactionBase64, rpcUrl) => {
        calls.sendRaw = { rpcUrl, transactionBase64 };
        return { txHash: "submitted-signature" };
      },
      signAndSend: () => {
        throw new Error("signAndSend should not be called when signTransaction is provided");
      },
      signTransaction: (wallet, chain, txHex) => {
        calls.signTransaction = { chain, txHex, wallet };
        return { signature: signatureHex };
      },
    },
  );

  assert.equal(calls.loadIdl.programId, PROGRAM_ID);
  assert.equal(calls.loadIdl.rpcUrl, "https://rpc.example.com");
  assert.equal(calls.pickInstructionsCount, 1);
  assert.equal(calls.resolveArgs, "initialize");
  assert.equal(calls.resolveAccountsCount, 3);
  assert.equal(calls.signTransaction.wallet, "agent-treasury");
  assert.equal(calls.signTransaction.chain, "solana");
  assert.ok(typeof calls.sendRaw.transactionBase64 === "string");
  assert.equal(calls.sendRaw.rpcUrl, "https://rpc.example.com");
  assert.equal(result.txHash, "submitted-signature");
  assert.equal(result.programId, PROGRAM_ID);
  assert.equal(result.from, SIGNER_ADDRESS);
  assert.equal(result.instructions.length, 1);
  assert.equal(result.instructions[0].name, "initialize");
  assert.equal(result.recentBlockhash, "EkSnNWid2cvwEVnVx9aBqawnmiCNiDgp3gUdkDPTKN1N");
});

test("inspectIdl returns a catalog with account resolution hints", async () => {
  const catalog = await inspectIdl(
    { programId: PROGRAM_ID, rpcUrl: "https://rpc.example.com" },
    {
      loadIdl: async () => ({ idl: COUNTER_IDL, source: { kind: "on-chain", location: PROGRAM_ID } }),
    },
  );

  assert.equal(catalog.programId, PROGRAM_ID);
  assert.equal(catalog.name, "counter");
  assert.equal(catalog.instructions.length, 1);

  const [initialize] = catalog.instructions;
  assert.equal(initialize.name, "initialize");
  assert.deepEqual(initialize.args, [{ name: "start", type: "u64" }]);

  const accounts = Object.fromEntries(initialize.accounts.map((a) => [a.name, a]));
  assert.equal(accounts.authority.autoResolvable, true);
  assert.equal(accounts.authority.resolvedBy, "signer");
  assert.equal(accounts.systemProgram.autoResolvable, true);
  assert.equal(accounts.systemProgram.resolvedBy, "idl-address");
  // `counter` uses a PDA with an `account` seed which we don't resolve upfront in the catalog,
  // so it should fall through to non-auto-resolvable (prompt required).
  assert.equal(accounts.counter.autoResolvable, false);
});

test("executeInvoke honours --ix selection and argument overrides", async () => {
  const calls = { signCount: 0 };

  const result = await executeInvoke(
    {
      argOverrides: { initialize: { start: "42" } },
      programId: PROGRAM_ID,
      rpcUrl: "https://rpc.example.com",
      selection: ["initialize"],
      wallet: "agent-treasury",
      yes: true,
    },
    {
      fetchLatestBlockhash: async () => "EkSnNWid2cvwEVnVx9aBqawnmiCNiDgp3gUdkDPTKN1N",
      getWallet: () => ({
        accounts: [
          { address: SIGNER_ADDRESS, chainId: "solana:mainnet", derivationPath: "m/44'/501'/0'/0'" },
        ],
        createdAt: "2026-04-07T00:00:00.000Z",
        id: "wallet-id",
        name: "agent-treasury",
      }),
      listWallets: () => [{ id: "wallet-id", name: "agent-treasury" }],
      loadIdl: async () => ({
        idl: COUNTER_IDL,
        source: { kind: "on-chain", location: PROGRAM_ID },
      }),
      pickInstructions: async () => {
        throw new Error("should not prompt when --ix is provided");
      },
      promptConfirm: async () => true,
      promptLine: async () => undefined,
      promptSecret: async () => undefined,
      // The default resolvers walk the IDL and consume overrides; mirror that here.
      resolveArgs: async (ix, _idl, overrides) => {
        const override = overrides?.start;
        if (override === undefined) {
          throw new Error("expected start override");
        }
        return { start: new BN(override) };
      },
      resolveAccounts: async (_ix, _idl, context) => ({
        authority: context.signer,
        counter: new PublicKey("Counter111111111111111111111111111111111111"),
        systemProgram: new PublicKey("11111111111111111111111111111111"),
      }),
      runOwsCli: async () => 0,
      sendRawTransaction: async () => ({ txHash: "sent-sig" }),
      signAndSend: () => ({ txHash: "unused" }),
      signTransaction: () => {
        calls.signCount += 1;
        return { signature: Buffer.alloc(64, 3).toString("hex") };
      },
    },
  );

  assert.equal(calls.signCount, 1);
  assert.equal(result.txHash, "sent-sig");
  assert.equal(result.instructions[0].name, "initialize");
});

test("executeInvoke dry-run returns a plan without signing", async () => {
  const result = await executeInvoke(
    {
      dryRun: true,
      programId: PROGRAM_ID,
      rpcUrl: "https://rpc.example.com",
      selection: ["initialize"],
      wallet: "agent-treasury",
      yes: true,
    },
    {
      fetchLatestBlockhash: async () => "EkSnNWid2cvwEVnVx9aBqawnmiCNiDgp3gUdkDPTKN1N",
      getWallet: () => ({
        accounts: [
          { address: SIGNER_ADDRESS, chainId: "solana:mainnet", derivationPath: "m/44'/501'/0'/0'" },
        ],
        createdAt: "2026-04-07T00:00:00.000Z",
        id: "wallet-id",
        name: "agent-treasury",
      }),
      listWallets: () => [{ id: "wallet-id", name: "agent-treasury" }],
      loadIdl: async () => ({
        idl: COUNTER_IDL,
        source: { kind: "on-chain", location: PROGRAM_ID },
      }),
      pickInstructions: async () => [],
      promptConfirm: async () => false,
      promptLine: async () => undefined,
      promptSecret: async () => undefined,
      resolveArgs: async () => ({ start: new BN(1) }),
      resolveAccounts: async (_ix, _idl, context) => ({
        authority: context.signer,
        counter: new PublicKey("Counter111111111111111111111111111111111111"),
        systemProgram: new PublicKey("11111111111111111111111111111111"),
      }),
      runOwsCli: async () => 0,
      sendRawTransaction: async () => {
        throw new Error("dry-run must not broadcast");
      },
      signAndSend: () => {
        throw new Error("dry-run must not sign");
      },
      signTransaction: () => {
        throw new Error("dry-run must not sign");
      },
    },
  );

  assert.equal(result.dryRun, true);
  assert.equal(result.txHash, undefined);
  assert.equal(result.instructions[0].name, "initialize");
  assert.equal(result.recentBlockhash, "EkSnNWid2cvwEVnVx9aBqawnmiCNiDgp3gUdkDPTKN1N");
});

test("executeInvoke aborts cleanly when the user declines confirmation", async () => {
  await assert.rejects(
    () =>
      executeInvoke(
        {
          programId: PROGRAM_ID,
          rpcUrl: "https://rpc.example.com",
          wallet: "agent-treasury",
        },
        {
          fetchLatestBlockhash: async () => "EkSnNWid2cvwEVnVx9aBqawnmiCNiDgp3gUdkDPTKN1N",
          getWallet: () => ({
            accounts: [
              {
                address: SIGNER_ADDRESS,
                chainId: "solana:mainnet",
                derivationPath: "m/44'/501'/0'/0'",
              },
            ],
            createdAt: "2026-04-07T00:00:00.000Z",
            id: "wallet-id",
            name: "agent-treasury",
          }),
          listWallets: () => [{ id: "wallet-id", name: "agent-treasury" }],
          loadIdl: async () => ({
            idl: COUNTER_IDL,
            source: { kind: "on-chain", location: PROGRAM_ID },
          }),
          pickInstructions: async (idl) => [idl.instructions[0]],
          promptConfirm: async () => false,
          promptLine: async () => undefined,
          promptSecret: async () => undefined,
          resolveArgs: async () => ({ start: new BN(1) }),
          resolveAccounts: async (_ix, _idl, context) => ({
            authority: context.signer,
            counter: new PublicKey("Counter111111111111111111111111111111111111"),
            systemProgram: new PublicKey("11111111111111111111111111111111"),
          }),
          runOwsCli: async () => 0,
          sendRawTransaction: async () => {
            throw new Error("should not broadcast on abort");
          },
          signAndSend: () => {
            throw new Error("should not sign on abort");
          },
          signTransaction: () => {
            throw new Error("should not sign on abort");
          },
        },
      ),
    /Aborted before signing/,
  );
});
