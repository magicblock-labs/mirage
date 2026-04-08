---
name: mirage-private-transfer
description: Use when the user wants to receive funds with `mirage fund`, resolve Mirage wallet addresses, or send a private SPL transfer with `mirage transfer`, including safe confirmation and post-send verification.
---

# Mirage Private Transfer

Use this skill when the task is an actual Mirage funding or transfer flow.

## Safety

- Treat `mirage fund` and `mirage transfer` as live-money actions.
- Before opening a funding link or broadcasting a transfer, restate the exact wallet, recipient, mint, amount, and network in one short confirmation.
- Prefer `OWS_PASSPHRASE` over passing `--passphrase` on the command line.
- Do not convert UI amounts to base units for `mirage transfer`; the CLI already accepts UI amounts like `0.1`.

## Workflow

1. Resolve the sender or recipient address if the user gives a wallet name.
   - Use `mirage address --wallet <name>`.
   - The default wallet is `agent-treasury`.
2. If the user wants to receive funds or top up a wallet, use:
   - `mirage fund`
   - `mirage fund --wallet <name>`
   - This opens MagicBlock One with the wallet address as `rcv`.
3. If the user wants a private transfer, prefer:
   - `mirage transfer --to <recipient> --amount <ui-amount>`
   - Add `--wallet <name>` when the sender is not `agent-treasury`.
   - Add `--mint <mint>` only when the user wants a non-default mint.
   - Keep the default private visibility unless the user explicitly asks for `public`.
   - Use `--cluster` or `--rpc-url` only when the user asks or the environment requires it.
4. After a transfer:
   - Report the transaction signature and sender address.
   - If useful, verify status on Solana RPC or check balances with `mirage balance`.

## Common Commands

```bash
mirage fund
mirage fund --wallet agent-treasury

mirage address --wallet recipient-wallet

mirage transfer --to <recipient> --amount 0.1
mirage transfer --wallet sender-wallet --to <recipient> --amount 2.5
mirage transfer --wallet sender-wallet --to <recipient> --mint <mint> --amount 1
```

## Notes

- `mirage fund` is the receive/top-up flow, not a send flow.
- `mirage transfer` defaults to mainnet USDC and private visibility.
- If the user only supplies a recipient wallet name, resolve it with `mirage address` before sending.
- On older Mirage installs, `BlockhashNotFound` on private transfers can indicate an outdated global CLI. Re-run with the current build if needed.
