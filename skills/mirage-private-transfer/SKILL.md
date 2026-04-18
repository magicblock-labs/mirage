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
   - Always attempt the program ID on its own first: run `mirage invoke <program-id>` (add `--cluster devnet` or `--rpc-url <url>` for non-mainnet). Most Anchor programs publish their IDL on-chain, so this is the expected default path.
   - If Mirage errors with `No Anchor IDL is published on-chain for <program-id>. Provide one with --idl <path>.`, ask the user for a local IDL JSON file (e.g. from their repo at `target/idl/<name>.json` or the program's GitHub) and retry with `mirage invoke <program-id> --idl <path> ...`.
   - When running from a non-interactive environment (shell scripts, an agent harness like Claude Code, CI), drive the command entirely through flags instead of the interactive prompts:
     1. First, inspect the program with `mirage invoke <program-id> --cluster <cluster> --show-idl` (add `--idl <path>` if the on-chain IDL is unavailable). It emits a JSON catalog listing every instruction, its args with types, and whether each account is auto-resolvable (signer, IDL address, well-known sysvar/program, or PDA with fully declared seeds). Use this to decide which instruction(s) to run and which accounts/args you still need from the user.
     2. Then run `mirage invoke <program-id> --cluster <cluster> --ix <name> [--ix <name> ...] --arg <ix>.<name>=<value> ... --account <ix>.<name>=<pubkey> ... --yes` to build, sign, and send without any prompts. Repeat `--ix`, `--arg`, and `--account` as many times as needed. Use `--dry-run` to preview the resolved transaction plan without signing when you want to confirm with the user first.
   - During interactive use, the CLI fetches the IDL, lets the user pick one or more instructions, auto-derives the signer, well-known sysvars/programs, and any IDL-declared PDAs, and only prompts for args or accounts it cannot resolve. The user then confirms a final transaction summary before it is signed and broadcast.
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

mirage invoke <program-id> --cluster devnet                      # interactive: tries on-chain IDL
mirage invoke <program-id> --idl ./target/idl/<name>.json        # fallback when no on-chain IDL

# non-interactive (agents / scripts / CI):
mirage invoke <program-id> --cluster devnet --show-idl           # emit IDL catalog as JSON, then exit
mirage invoke <program-id> --cluster devnet \
  --ix increment \
  --arg increment.amount=1 \
  --account increment.counter=<pubkey> \
  --dry-run                                                      # preview the resolved plan, no signing
mirage invoke <program-id> --cluster devnet --ix increment --yes # run with auto-resolution for everything
```

## Notes

- `mirage fund` is the receive or top-up flow, not a send flow.
- `mirage transfer` defaults to mainnet USDC and private visibility, but it also supports `--visibility public`.
- If the user only supplies a recipient wallet name, resolve it with `mirage address` before sending.
- If the user needs a brand-new named wallet, create it explicitly with `mirage ows wallet create --name <wallet>` before using it in other commands.
- Use `mirage ows sign tx` for arbitrary Solana transactions that are outside Mirage's higher-level transfer flow.
- `mirage invoke` defaults to the on-chain Anchor IDL PDA. Try the bare `mirage invoke <program-id>` form first; only ask the user for a local IDL when Mirage reports that no on-chain IDL is published.
- `mirage invoke` auto-derives signers, well-known sysvars/programs, and PDAs whose seeds are declared in the IDL. Any remaining account is prompted for, so the flow works even with partially-declared IDL metadata.
- On older Mirage installs, `BlockhashNotFound` on private transfers can indicate an outdated global CLI. Re-run with the current build if needed.
