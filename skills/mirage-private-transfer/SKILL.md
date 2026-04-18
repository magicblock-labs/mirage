---
name: mirage-private-transfer
description: Use when the user wants to build, sign, and send a transaction for ANY Solana program that has an Anchor IDL (either published on-chain or supplied locally), or when they want to create or manage a Mirage Solana wallet, fund it, send public or private SPL transfers, resolve Mirage wallet addresses, or sign other Solana transactions through `mirage` or `mirage ows`, including safe confirmation and post-send verification.
---

# Mirage Solana Wallet and Program-Invocation Workflow

Use this skill whenever the task involves a Mirage wallet, a funding or transfer flow, a Solana signing flow, or invoking an Anchor program on Solana by its IDL. With `mirage invoke`, this skill can construct and send an instruction or transaction for any Solana program that has an Anchor IDL — no bespoke client code required.

## Safety

- Treat wallet funding, transfer, program-invocation, and transaction-signing flows as sensitive actions.
- Before opening a funding link, broadcasting a transfer, or signing an arbitrary Solana transaction, restate the exact wallet, recipient, mint, amount, network, and transaction source in one short confirmation.
- Before running `mirage invoke`, restate the program ID, cluster (devnet or mainnet), the instruction(s) picked, and any user-provided arguments or accounts. Prefer devnet for first-time runs on an unfamiliar program.
- Prefer `OWS_PASSPHRASE` over passing `--passphrase` on the command line.
- Do not convert UI amounts to base units for `mirage transfer`; the CLI already accepts UI amounts like `0.1`.

## Workflow

1. Create or resolve the wallet the user wants to operate.
   - Create a named wallet with `mirage ows wallet create --name <wallet>`.
   - Use `mirage ows wallet list` when the user needs to inspect available wallets.
   - `mirage address`, `mirage balance`, `mirage fund`, and `mirage transfer` auto-create the default `agent-treasury` wallet if it is missing.
2. Resolve the sender or recipient address if the user gives a wallet name.
   - Use `mirage address --wallet <name>`.
   - The default wallet is `agent-treasury`.
3. If the user wants to receive funds or top up a wallet, use:
   - `mirage fund`
   - `mirage fund --wallet <name>`
   - This opens the Mirage funding flow with the wallet address as `rcv`.
   - If the user wants a private or non-private funding flow, keep the request scoped to Mirage's hosted funding flow and follow the requested visibility there.
4. If the user wants an SPL transfer, prefer:
   - `mirage transfer --to <recipient> --amount <ui-amount>`
   - Add `--wallet <name>` when the sender is not `agent-treasury`.
   - Add `--mint <mint>` only when the user wants a non-default mint.
   - Add `--visibility private` or `--visibility public` to match the user's request. The default is private.
   - Use `--cluster` or `--rpc-url` only when the user asks or the environment requires it.
5. If the user wants to invoke an arbitrary Anchor program:
   - Use `mirage invoke <program-id>` to fetch the on-chain IDL, pick one or more instructions interactively, auto-derive the signer, sysvars, and any IDL-declared PDAs, prompt for remaining args and accounts, then sign and send as a single atomic transaction.
   - Add `--cluster devnet` (or `--rpc-url <url>`) for any non-mainnet run, and prefer devnet when exploring a new program.
   - Add `--idl <path>` when the program has no on-chain IDL or when the user supplies a local IDL JSON file.
   - Add `--wallet <name>` when the fee payer is not `agent-treasury`.
   - Add `--yes` only when the user has already confirmed the full transaction plan; otherwise let the CLI show the final summary and prompt for confirmation.
   - Report the transaction signature and a cluster-appropriate explorer URL after the send.
6. If the user wants to sign some other Solana transaction instead of using the transfer or invoke flows:
   - Use `mirage ows sign tx --wallet <name> --chain solana --tx <unsigned-tx-hex>`.
   - Use `mirage ows sign message --wallet <name> --chain solana --message "<message>"` only for message-signing tasks, not transaction signing.
7. After a transfer or invoke:
   - Report the transaction signature and sender address.
   - If useful, verify status on Solana RPC or check balances with `mirage balance`.

## Common Commands

```bash
mirage ows wallet create --name agent-treasury-1
mirage ows wallet list

mirage fund
mirage fund --wallet agent-treasury

mirage address --wallet recipient-wallet

mirage transfer --to <recipient> --amount 0.1
mirage transfer --wallet sender-wallet --to <recipient> --amount 2.5
mirage transfer --wallet sender-wallet --to <recipient> --amount 2.5 --visibility public
mirage transfer --wallet sender-wallet --to <recipient> --mint <mint> --amount 1

mirage ows sign tx --wallet agent-treasury --chain solana --tx <unsigned-tx-hex>

mirage invoke <program-id> --cluster devnet
mirage invoke <program-id> --idl ./path/to/idl.json --cluster devnet
mirage invoke <program-id> --wallet sender-wallet --rpc-url https://api.mainnet-beta.solana.com
```

## Notes

- `mirage fund` is the receive or top-up flow, not a send flow.
- `mirage transfer` defaults to mainnet USDC and private visibility, but it also supports `--visibility public`.
- If the user only supplies a recipient wallet name, resolve it with `mirage address` before sending.
- If the user needs a brand-new named wallet, create it explicitly with `mirage ows wallet create --name <wallet>` before using it in other commands.
- Use `mirage ows sign tx` for arbitrary Solana transactions that are outside Mirage's higher-level transfer flow.
- `mirage invoke` requires the program's Anchor IDL. If neither the on-chain IDL nor a `--idl` file is available, the command errors out; surface a local IDL path or ask the user to supply one.
- `mirage invoke` auto-derives signers, well-known sysvars/programs, and PDAs whose seeds are declared in the IDL. Any remaining account is prompted for, so the flow works even with partially-declared IDL metadata.
- On older Mirage installs, `BlockhashNotFound` on private transfers can indicate an outdated global CLI. Re-run with the current build if needed.
