Use `skills/mirage-private-transfer/SKILL.md` as the canonical workflow for Mirage funding and private transfer tasks.

When invoked:

1. Resolve wallet names to Solana addresses with `mirage address` when needed.
2. Use `mirage fund` when the user wants to receive funds or top up a wallet.
3. Use `mirage transfer` for private sends.
4. Before live actions, restate the exact wallet, recipient, mint, amount, and network for confirmation.
5. After a send, report the sender address and transaction signature, and verify status if useful.
