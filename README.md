<div align="center">
  <img src="./assets/banner.png" alt="Mirage" />
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

This repo includes a reusable agentic Solana wallet skill in [skills/mirage-solana-wallet/SKILL.md](./skills/mirage-solana-wallet/SKILL.md).

- Install it from GitHub with `npx skills add magicblock-labs/mirage`.
- To install this specific skill non-interactively, use `npx skills add magicblock-labs/mirage --skill mirage-solana-wallet`.
- The skill covers creating Solana wallets with `mirage ows wallet create`, funding wallets through `mirage fund`, invoking any Anchor program by its IDL with `mirage invoke` (interactive or via non-interactive `--show-idl` / `--ix` / `--arg` / `--account` / `--dry-run` flags for agents and scripts), sending public or private SPL transfers with `mirage transfer`, and signing arbitrary Solana transactions with `mirage ows sign tx`.

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
