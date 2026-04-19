Use `skills/mirage-solana-wallet/SKILL.md` as the canonical workflow for operating a Solana wallet through Mirage — wallet management, funding, invoking any Anchor program by its IDL, public or private SPL transfers, and arbitrary transaction or message signing.

When invoked:

1. Resolve wallet names to Solana addresses with `mirage address` when needed; check balances with `mirage balance`.
2. Use `mirage fund` when the user wants to receive funds or top up a wallet.
3. Use `mirage invoke <program-id>` to build, sign, and send any Anchor program instruction. Prefer the non-interactive flags (`--show-idl`, `--ix`, `--arg`, `--account`, `--dry-run`, `--yes`) when there is no TTY.
4. Use `mirage transfer` for SPL sends (private by default; pass `--visibility public` to opt out).
5. Use `mirage ows sign tx` or `mirage ows sign message` for raw Solana signing outside the transfer or invoke flows.
6. Before live actions, restate the exact wallet, network, program/recipient, mint, amount, instruction(s), and any user-provided args or accounts for confirmation.
7. After a send, report the sender address, transaction signature, and explorer URL; verify status with `mirage balance` or Solana RPC when useful.
