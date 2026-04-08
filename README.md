<div align="center">
  <img src="./openapi/mirage.jpg" width="168" alt="Mirage logo" />
  <h1>@magicblock-labs/mirage</h1>
  <p>Commander-based CLI for MagicBlock private payments, wallet funding, and Solana transactions.</p>
  <p>
    <a href="https://github.com/magicblock-labs/mirage">Repository</a>
    ·
    <a href="https://www.npmjs.com/package/@magicblock-labs/mirage">npm package</a>
  </p>
</div>

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
