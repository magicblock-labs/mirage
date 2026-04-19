---
name: mirage-solana-wallet
description: Use when the user wants to operate a Solana wallet from an agent — creating or resolving named wallets, funding them, reading balances, invoking ANY Anchor program by its IDL (on-chain or local), sending public or private SPL transfers, signing arbitrary transactions or messages — through `mirage` and `mirage ows`, with safe confirmation and post-send verification.
---

# Mirage Solana Agent Wallet

Use this skill whenever the task is a Solana wallet operation the agent should execute on the user's behalf: wallet creation, address resolution, balance checks, funding, arbitrary Anchor program calls, SPL transfers (public or private), or raw transaction/message signing. Everything runs through `mirage` and the bundled `mirage ows` CLI using an OWS-backed wallet (default: `agent-treasury`).

## Safety

- Treat every wallet, funding, transfer, program-invocation, and signing flow as a sensitive action.
- Before opening a funding link, broadcasting a transfer, invoking a program instruction, or signing a raw transaction, restate the exact wallet, network (cluster/rpc), program/recipient, mint, amount, instruction(s), and any user-provided args or accounts in one short confirmation.
- Prefer devnet for first-time runs against an unfamiliar program.
- Prefer `OWS_PASSPHRASE` over passing `--passphrase` on the command line.
- Do not convert UI amounts to base units for `mirage transfer`; the CLI already accepts UI amounts like `0.1`.

## Workflow

1. Create or resolve the wallet to operate.
   - Create a named wallet with `mirage ows wallet create --name <wallet>`.
   - List wallets with `mirage ows wallet list`.
   - `mirage address`, `mirage balance`, `mirage fund`, `mirage transfer`, and `mirage invoke` auto-create the default `agent-treasury` wallet if it is missing.
   - Resolve a wallet's Solana address with `mirage address --wallet <name>`; check balance with `mirage balance --wallet <name>`.
2. If the user wants to receive or top up, use `mirage fund` (add `--wallet <name>` when it is not `agent-treasury`). This opens the Mirage hosted funding flow with the wallet address as `rcv`.
3. If the user wants to invoke an arbitrary Anchor program (build + sign + send any instruction):
   - Always attempt the program ID on its own first: `mirage invoke <program-id>` (add `--cluster devnet` or `--rpc-url <url>` for non-mainnet). Most Anchor programs publish their IDL on-chain, so this is the default path.
   - If Mirage errors with `No Anchor IDL is published on-chain for <program-id>. Provide one with --idl <path>.`, ask the user for a local IDL JSON file (e.g. `target/idl/<name>.json` in their repo, or downloaded from the program's GitHub) and retry with `--idl <path>`.
   - In a non-interactive environment (scripts, CI, or any agent harness without a TTY), drive the command entirely through flags instead of the interactive picker:
     1. Inspect first: `mirage invoke <program-id> --cluster <cluster> --show-idl` emits a JSON catalog listing every instruction, each arg with its type, and whether every account is auto-resolvable (signer, IDL-declared address, well-known sysvar/program, or PDA with fully declared seeds). Use this to know which instruction(s) to run and which `--account`/`--arg` values you still need from the user.
     2. Run: `mirage invoke <program-id> --cluster <cluster> --ix <name> [--ix <name> ...] --arg <ix>.<name>=<value> ... --account <ix>.<name>=<pubkey> ... --yes`. Repeat `--ix`, `--arg`, and `--account` as needed. Add `--dry-run` to preview the resolved plan without signing when you want to confirm with the user first.
   - In interactive use, Mirage fetches the IDL, lets the user pick one or more instructions, auto-derives the signer, well-known sysvars/programs, and IDL-declared PDAs, and only prompts for args or accounts it cannot resolve, then confirms a final summary before signing.
   - Add `--wallet <name>` when the fee payer is not `agent-treasury`. Add `--yes` only when the user has confirmed the full plan.
4. If the user wants an SPL transfer (public or private):
   - `mirage transfer --to <recipient> --amount <ui-amount>` — defaults to mainnet USDC, private visibility, `agent-treasury` sender.
   - Add `--wallet <name>` when the sender is not `agent-treasury`.
   - Add `--mint <mint>` for a non-default mint.
   - Add `--visibility public` to opt out of private routing; `--visibility private` is the default.
   - Use `--cluster` or `--rpc-url` only when the user asks or the environment requires it.
5. If the user wants to sign an arbitrary Solana transaction or message (outside the transfer/invoke flows):
   - `mirage ows sign tx --wallet <name> --chain solana --tx <unsigned-tx-hex>` for raw transactions.
   - `mirage ows sign message --wallet <name> --chain solana --message "<message>"` for message-signing only (not for transactions).
6. Report the outcome:
   - Include the transaction signature and sender address.
   - For `mirage invoke`, include the cluster-appropriate explorer URL printed by the CLI.
   - Verify status on Solana RPC or check `mirage balance` when it is useful.

## Common Commands

```bash
# Wallet management
mirage ows wallet create --name agent-treasury-1
mirage ows wallet list
mirage address --wallet recipient-wallet
mirage balance --wallet agent-treasury

# Funding
mirage fund
mirage fund --wallet agent-treasury

# Invoke any Anchor program by IDL
mirage invoke <program-id> --cluster devnet                      # interactive; on-chain IDL
mirage invoke <program-id> --idl ./target/idl/<name>.json        # local IDL fallback

# Non-interactive invoke (agents / scripts / CI)
mirage invoke <program-id> --cluster devnet --show-idl           # JSON catalog of instructions + accounts
mirage invoke <program-id> --cluster devnet \
  --ix increment \
  --arg increment.amount=1 \
  --account increment.counter=<pubkey> \
  --dry-run                                                      # preview the plan, no signing
mirage invoke <program-id> --cluster devnet --ix increment --yes # run with auto-resolution

# SPL transfers
mirage transfer --to <recipient> --amount 0.1
mirage transfer --wallet sender-wallet --to <recipient> --amount 2.5
mirage transfer --wallet sender-wallet --to <recipient> --amount 2.5 --visibility public
mirage transfer --wallet sender-wallet --to <recipient> --mint <mint> --amount 1

# Arbitrary signing
mirage ows sign tx --wallet agent-treasury --chain solana --tx <unsigned-tx-hex>
mirage ows sign message --wallet agent-treasury --chain solana --message "hello"
```

## Notes

- `mirage fund` is a receive/top-up flow, not a send flow.
- `mirage transfer` defaults to mainnet USDC and private visibility; set `--visibility public` to opt out of private routing.
- If the user only supplies a recipient wallet name, resolve it with `mirage address` before sending.
- Create a brand-new named wallet explicitly with `mirage ows wallet create --name <wallet>` before using it in other commands.
- `mirage invoke` defaults to the on-chain Anchor IDL PDA. Try the bare `mirage invoke <program-id>` form first; only ask the user for a local IDL when Mirage reports that no on-chain IDL is published.
- `mirage invoke` auto-derives signers, well-known sysvars/programs, and PDAs whose seeds are declared in the IDL; anything else is prompted for (interactively) or requires `--account`/`--arg` flags (non-interactively).
- Use `mirage ows sign tx` for raw Solana transactions that do not fit `mirage transfer` or `mirage invoke`.
- On older Mirage installs, `BlockhashNotFound` on private transfers can indicate an outdated global CLI. Re-run with the current build if needed.
