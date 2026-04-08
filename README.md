<div align="center">
  <img src="./openapi/mirage.jpg" width="168" alt="Mirage logo" />
  <h1>@magicblock-labs/mirage</h1>
  <p>Commander-based CLI for MagicBlock private payments, wallet funding, and Solana transactions.</p>
</div>

## Packages

| Package                   | Description                                                          | Version                                                                                                                           | Docs                                                                                                                                                    |
|:--------------------------|:---------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------|
| `@magicblock-labs/mirage` | Commander-based CLI for MagicBlock private payments and wallet flows | [![npm version](https://img.shields.io/npm/v/%40magicblock-labs%2Fmirage?color=blue)](https://www.npmjs.com/package/@magicblock-labs/mirage) | [![docs quickstart](https://img.shields.io/badge/docs-quickstart-blue)](https://docs.magicblock.gg/pages/private-ephemeral-rollups-pers/how-to-guide/quickstart) |

## Install

```bash
npm install -g @magicblock-labs/mirage
```

After install, the CLI is available as:

```bash
mirage --help
```

Mirage includes built-in support for [Open Wallet Standard (OWS)](https://openwallet.sh), and exposes the bundled CLI through `mirage ows ...`.
Mirage also uses the shared OWS config at `~/.ows/config.json` for its default Solana RPC.

## What It Does

- `mirage address` prints the Solana public key for an OWS wallet
- `mirage balance` shows the wallet balance through `ows fund balance`
- `mirage fund` opens `https://one.magicblock.app/` in the browser with `rcv=<wallet-pubkey>`
- `mirage transfer` accepts UI amounts like `0.1`, defaults `--mint` to mainnet USDC, resolves mint decimals over Solana RPC, builds a transaction from the MagicBlock payments API, signs it with OWS, and sends it on Solana
- `mirage ows ...` forwards directly to the bundled `ows` CLI
- `mirage api ...` exposes low-level commands generated from the checked-in OpenAPI schema

`mirage address`, `mirage balance`, `mirage fund`, and `mirage transfer` default to the `agent-treasury` wallet. If `agent-treasury` does not exist yet, Mirage creates it automatically before running the command. Passing `--wallet <name>` uses that existing OWS wallet instead.

## Examples

```bash
mirage address
mirage address --wallet agent-treasury-1

mirage balance
mirage balance --wallet agent-treasury-1

mirage fund
mirage fund --wallet agent-treasury-1

mirage transfer \
  --to <recipient> \
  --amount 0.1

# equivalent explicit mint
mirage transfer \
  --to <recipient> \
  --mint EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v \
  --amount 0.1

mirage ows sign message --wallet agent-treasury --chain solana --message "hello"
```

## Skills

This repo includes a reusable Mirage transfer skill in [skills/mirage-private-transfer/SKILL.md](./skills/mirage-private-transfer/SKILL.md).

- Codex: copy `skills/mirage-private-transfer/` into `$CODEX_HOME/skills/` or `~/.codex/skills/`, then invoke it with `$mirage-private-transfer`.
- Claude Code: copy [.claude/commands/mirage-private-transfer.md](./.claude/commands/mirage-private-transfer.md) into your project’s `.claude/commands/` directory, then invoke `/mirage-private-transfer`.
- The skill covers resolving wallet addresses, opening `mirage fund` to receive funds, sending private transfers with `mirage transfer`, and reporting the sender plus signature after broadcast.

## Development

```bash
npm install
npm run build
npm test
```

OpenAPI codegen commands:

```bash
npm run openapi:generate
npm run openapi:update -- "/path/to/api.json"
```
