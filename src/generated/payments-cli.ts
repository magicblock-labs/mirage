/*
 * This file is generated from the checked-in MagicBlock payments OpenAPI schema.
 * Do not edit it by hand. Run `npm run generate` instead.
 */
export type GeneratedCommandOptionLocation = "body" | "path" | "query";
export type GeneratedCommandOptionType = "boolean" | "integer" | "string";

export interface GeneratedCommandOption {
  description: string;
  enumValues?: string[];
  flag: string;
  location: GeneratedCommandOptionLocation;
  maximum?: number;
  minimum?: number;
  name: string;
  optionKey: string;
  pattern?: string;
  required: boolean;
  type: GeneratedCommandOptionType;
}

export interface GeneratedCommandSpec {
  description: string;
  method: string;
  name: string;
  options: GeneratedCommandOption[];
  path: string;
}

export const generatedCommands: GeneratedCommandSpec[] = [
  {
    "description": "Get the balance for the owner's ATA on the base RPC.",
    "method": "get",
    "name": "balance",
    "options": [
      {
        "description": "Value for address.",
        "flag": "--address <value>",
        "location": "query",
        "name": "address",
        "optionKey": "address",
        "required": true,
        "type": "string"
      },
      {
        "description": "Value for mint.",
        "flag": "--mint <value>",
        "location": "query",
        "name": "mint",
        "optionKey": "mint",
        "required": true,
        "type": "string"
      },
      {
        "description": "Optional. Use `mainnet` for BASE_RPC_URL and EPHEMERAL_RPC_URL, `devnet` for BASE_DEVNET_RPC_URL and EPHEMERAL_DEVNET_RPC_URL, or provide a custom http(s) RPC URL to override the base RPC while keeping the configured ephemeral RPC.",
        "flag": "--cluster <value>",
        "location": "query",
        "name": "cluster",
        "optionKey": "cluster",
        "required": false,
        "type": "string"
      }
    ],
    "path": "/v1/spl/balance"
  },
  {
    "description": "Generate a challenge string for the wallet to sign.",
    "method": "get",
    "name": "challenge",
    "options": [
      {
        "description": "Optional. Use `mainnet` for BASE_RPC_URL and EPHEMERAL_RPC_URL, `devnet` for BASE_DEVNET_RPC_URL and EPHEMERAL_DEVNET_RPC_URL, or provide a custom http(s) RPC URL to override the base RPC while keeping the configured ephemeral RPC.",
        "flag": "--cluster <value>",
        "location": "query",
        "name": "cluster",
        "optionKey": "cluster",
        "required": false,
        "type": "string"
      },
      {
        "description": "The public key of the wallet that will read private data",
        "flag": "--pubkey <value>",
        "location": "query",
        "name": "pubkey",
        "optionKey": "pubkey",
        "required": true,
        "type": "string"
      },
      {
        "description": "Value for mock.",
        "flag": "--mock <value>",
        "location": "query",
        "name": "mock",
        "optionKey": "mock",
        "required": false,
        "type": "boolean"
      }
    ],
    "path": "/v1/spl/challenge"
  },
  {
    "description": "Deposit SPL tokens from Solana into an ephemeral rollup.",
    "method": "post",
    "name": "deposit",
    "options": [
      {
        "description": "Value for owner.",
        "flag": "--owner <value>",
        "location": "body",
        "name": "owner",
        "optionKey": "owner",
        "required": true,
        "type": "string"
      },
      {
        "description": "Optional. Use `mainnet` for BASE_RPC_URL and EPHEMERAL_RPC_URL, `devnet` for BASE_DEVNET_RPC_URL and EPHEMERAL_DEVNET_RPC_URL, or provide a custom http(s) RPC URL to override the base RPC while keeping the configured ephemeral RPC.",
        "flag": "--cluster <value>",
        "location": "body",
        "name": "cluster",
        "optionKey": "cluster",
        "required": false,
        "type": "string"
      },
      {
        "description": "Optional. Defaults to Solana USDC on mainnet: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v. On devnet it defaults to devnet USDC: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU.",
        "flag": "--mint <value>",
        "location": "body",
        "name": "mint",
        "optionKey": "mint",
        "required": false,
        "type": "string"
      },
      {
        "description": "Base-unit amount as an integer JSON value with minimum 1.",
        "flag": "--amount <value>",
        "location": "body",
        "minimum": 1,
        "name": "amount",
        "optionKey": "amount",
        "required": true,
        "type": "integer"
      },
      {
        "description": "Optional. Defaults to the selected ephemeral RPC identity resolved via `getIdentity`.",
        "flag": "--validator <value>",
        "location": "body",
        "name": "validator",
        "optionKey": "validator",
        "required": false,
        "type": "string"
      },
      {
        "description": "Value for initIfMissing.",
        "flag": "--init-if-missing <value>",
        "location": "body",
        "name": "initIfMissing",
        "optionKey": "initIfMissing",
        "required": false,
        "type": "boolean"
      },
      {
        "description": "Value for initVaultIfMissing.",
        "flag": "--init-vault-if-missing <value>",
        "location": "body",
        "name": "initVaultIfMissing",
        "optionKey": "initVaultIfMissing",
        "required": false,
        "type": "boolean"
      },
      {
        "description": "Value for initAtasIfMissing.",
        "flag": "--init-atas-if-missing <value>",
        "location": "body",
        "name": "initAtasIfMissing",
        "optionKey": "initAtasIfMissing",
        "required": false,
        "type": "boolean"
      },
      {
        "description": "Value for idempotent.",
        "flag": "--idempotent <value>",
        "location": "body",
        "name": "idempotent",
        "optionKey": "idempotent",
        "required": false,
        "type": "boolean"
      }
    ],
    "path": "/v1/spl/deposit"
  },
  {
    "description": "GET /health",
    "method": "get",
    "name": "health",
    "options": [],
    "path": "/health"
  },
  {
    "description": "Build an unsigned base-chain transaction that initializes and delegates a validator-scoped transfer queue for a mint.",
    "method": "post",
    "name": "initialize-mint",
    "options": [
      {
        "description": "Value for payer.",
        "flag": "--payer <value>",
        "location": "body",
        "name": "payer",
        "optionKey": "payer",
        "required": true,
        "type": "string"
      },
      {
        "description": "Value for mint.",
        "flag": "--mint <value>",
        "location": "body",
        "name": "mint",
        "optionKey": "mint",
        "required": true,
        "type": "string"
      },
      {
        "description": "Optional. Use `mainnet` for BASE_RPC_URL and EPHEMERAL_RPC_URL, `devnet` for BASE_DEVNET_RPC_URL and EPHEMERAL_DEVNET_RPC_URL, or provide a custom http(s) RPC URL to override the base RPC while keeping the configured ephemeral RPC.",
        "flag": "--cluster <value>",
        "location": "body",
        "name": "cluster",
        "optionKey": "cluster",
        "required": false,
        "type": "string"
      },
      {
        "description": "Optional. Defaults to the selected ephemeral RPC identity resolved via `getIdentity`.",
        "flag": "--validator <value>",
        "location": "body",
        "name": "validator",
        "optionKey": "validator",
        "required": false,
        "type": "string"
      }
    ],
    "path": "/v1/spl/initialize-mint"
  },
  {
    "description": "Check whether the validator-scoped transfer queue exists for a mint on the ephemeral RPC.",
    "method": "get",
    "name": "is-mint-initialized",
    "options": [
      {
        "description": "Value for mint.",
        "flag": "--mint <value>",
        "location": "query",
        "name": "mint",
        "optionKey": "mint",
        "required": true,
        "type": "string"
      },
      {
        "description": "Optional. Use `mainnet` for BASE_RPC_URL and EPHEMERAL_RPC_URL, `devnet` for BASE_DEVNET_RPC_URL and EPHEMERAL_DEVNET_RPC_URL, or provide a custom http(s) RPC URL to override the base RPC while keeping the configured ephemeral RPC.",
        "flag": "--cluster <value>",
        "location": "query",
        "name": "cluster",
        "optionKey": "cluster",
        "required": false,
        "type": "string"
      },
      {
        "description": "Optional. Defaults to the selected ephemeral RPC identity resolved via `getIdentity`.",
        "flag": "--validator <value>",
        "location": "query",
        "name": "validator",
        "optionKey": "validator",
        "required": false,
        "type": "string"
      }
    ],
    "path": "/v1/spl/is-mint-initialized"
  },
  {
    "description": "Login the wallet to the Private Ephemeral Rollup.",
    "method": "post",
    "name": "login",
    "options": [
      {
        "description": "Optional. Use `mainnet` for BASE_RPC_URL and EPHEMERAL_RPC_URL, `devnet` for BASE_DEVNET_RPC_URL and EPHEMERAL_DEVNET_RPC_URL, or provide a custom http(s) RPC URL to override the base RPC while keeping the configured ephemeral RPC.",
        "flag": "--cluster <value>",
        "location": "body",
        "name": "cluster",
        "optionKey": "cluster",
        "required": false,
        "type": "string"
      },
      {
        "description": "The public key of the wallet that will read private data",
        "flag": "--pubkey <value>",
        "location": "body",
        "name": "pubkey",
        "optionKey": "pubkey",
        "required": true,
        "type": "string"
      },
      {
        "description": "The challenge string generated by the Private Ephemeral Rollup",
        "flag": "--challenge <value>",
        "location": "body",
        "name": "challenge",
        "optionKey": "challenge",
        "required": true,
        "type": "string"
      },
      {
        "description": "The signature of the challenge by the wallet",
        "flag": "--signature <value>",
        "location": "body",
        "name": "signature",
        "optionKey": "signature",
        "required": true,
        "type": "string"
      },
      {
        "description": "Value for mock.",
        "flag": "--mock <value>",
        "location": "body",
        "name": "mock",
        "optionKey": "mock",
        "required": false,
        "type": "boolean"
      }
    ],
    "path": "/v1/spl/login"
  },
  {
    "description": "Get the balance for the owner's ATA on the ephemeral RPC.",
    "method": "get",
    "name": "private-balance",
    "options": [
      {
        "description": "Value for address.",
        "flag": "--address <value>",
        "location": "query",
        "name": "address",
        "optionKey": "address",
        "required": true,
        "type": "string"
      },
      {
        "description": "Value for mint.",
        "flag": "--mint <value>",
        "location": "query",
        "name": "mint",
        "optionKey": "mint",
        "required": true,
        "type": "string"
      },
      {
        "description": "Optional. Use `mainnet` for BASE_RPC_URL and EPHEMERAL_RPC_URL, `devnet` for BASE_DEVNET_RPC_URL and EPHEMERAL_DEVNET_RPC_URL, or provide a custom http(s) RPC URL to override the base RPC while keeping the configured ephemeral RPC.",
        "flag": "--cluster <value>",
        "location": "query",
        "name": "cluster",
        "optionKey": "cluster",
        "required": false,
        "type": "string"
      }
    ],
    "path": "/v1/spl/private-balance"
  },
  {
    "description": "Get a swap quote.",
    "method": "get",
    "name": "quote",
    "options": [
      {
        "description": "Input token mint address.",
        "flag": "--input-mint <value>",
        "location": "query",
        "name": "inputMint",
        "optionKey": "inputMint",
        "required": true,
        "type": "string"
      },
      {
        "description": "Output token mint address.",
        "flag": "--output-mint <value>",
        "location": "query",
        "name": "outputMint",
        "optionKey": "outputMint",
        "required": true,
        "type": "string"
      },
      {
        "description": "Raw amount to swap before decimals are applied.",
        "flag": "--amount <value>",
        "location": "query",
        "name": "amount",
        "optionKey": "amount",
        "pattern": "^\\d+$",
        "required": true,
        "type": "string"
      },
      {
        "description": "Slippage threshold in basis points.",
        "flag": "--slippage-bps <value>",
        "location": "query",
        "minimum": 0,
        "name": "slippageBps",
        "optionKey": "slippageBps",
        "required": false,
        "type": "integer"
      },
      {
        "description": "Use `ExactIn` for fixed input amount or `ExactOut` for fixed output amount.",
        "flag": "--swap-mode <value>",
        "location": "query",
        "name": "swapMode",
        "optionKey": "swapMode",
        "required": false,
        "type": "string"
      },
      {
        "description": "Optional comma-separated list of DEX labels to include.",
        "flag": "--dexes <value>",
        "location": "query",
        "name": "dexes",
        "optionKey": "dexes",
        "required": false,
        "type": "string"
      },
      {
        "description": "Optional comma-separated list of DEX labels to exclude.",
        "flag": "--exclude-dexes <value>",
        "location": "query",
        "name": "excludeDexes",
        "optionKey": "excludeDexes",
        "required": false,
        "type": "string"
      },
      {
        "description": "Restrict intermediate tokens to a more stable set.",
        "flag": "--restrict-intermediate-tokens <value>",
        "location": "query",
        "name": "restrictIntermediateTokens",
        "optionKey": "restrictIntermediateTokens",
        "required": false,
        "type": "boolean"
      },
      {
        "description": "Limit routing to a single hop.",
        "flag": "--only-direct-routes <value>",
        "location": "query",
        "name": "onlyDirectRoutes",
        "optionKey": "onlyDirectRoutes",
        "required": false,
        "type": "boolean"
      },
      {
        "description": "Request a legacy transaction-compatible route.",
        "flag": "--as-legacy-transaction <value>",
        "location": "query",
        "name": "asLegacyTransaction",
        "optionKey": "asLegacyTransaction",
        "required": false,
        "type": "boolean"
      },
      {
        "description": "Optional platform fee in basis points.",
        "flag": "--platform-fee-bps <value>",
        "location": "query",
        "minimum": 0,
        "name": "platformFeeBps",
        "optionKey": "platformFeeBps",
        "required": false,
        "type": "integer"
      },
      {
        "description": "Approximate maximum account budget for the route.",
        "flag": "--max-accounts <value>",
        "location": "query",
        "minimum": 0,
        "name": "maxAccounts",
        "optionKey": "maxAccounts",
        "required": false,
        "type": "integer"
      },
      {
        "description": "Instruction format to target.",
        "flag": "--instruction-version <value>",
        "location": "query",
        "name": "instructionVersion",
        "optionKey": "instructionVersion",
        "required": false,
        "type": "string"
      },
      {
        "description": "Keep for compatibility with upstream quote parameters.",
        "flag": "--dynamic-slippage <value>",
        "location": "query",
        "name": "dynamicSlippage",
        "optionKey": "dynamicSlippage",
        "required": false,
        "type": "boolean"
      },
      {
        "description": "Exclude routes that are incompatible with Jito bundles.",
        "flag": "--for-jito-bundle <value>",
        "location": "query",
        "name": "forJitoBundle",
        "optionKey": "forJitoBundle",
        "required": false,
        "type": "boolean"
      },
      {
        "description": "Allow dynamic selection of intermediate tokens.",
        "flag": "--support-dynamic-intermediate-tokens <value>",
        "location": "query",
        "name": "supportDynamicIntermediateTokens",
        "optionKey": "supportDynamicIntermediateTokens",
        "required": false,
        "type": "boolean"
      }
    ],
    "path": "/v1/swap/quote"
  },
  {
    "description": "Build an unsigned swap transaction from a quote. Supports two visibility modes: - **`visibility: \"public\"`** (default) — pure pass-through to the Jupiter/Metis upstream. The returned transaction is whatever the upstream produces. - **`visibility: \"private\"`** — the server forces Jupiter's output into a program-owned stash ATA (deterministically derived from `(userPublicKey, quoteResponse.outputMint)`), prepends an idempotent ATA-create, and appends a `schedule_private_transfer` instruction that registers a one-shot Hydra crank. When the crank fires, it self-CPIs into the on-chain private-transfer flow to deliver the swapped tokens to `destination` with the requested delay/split policy. The returned transaction is a v0 `VersionedTransaction` that is still unsigned — the client signs and submits. When `visibility = \"private\"`, the fields `destination`, `minDelayMs`, `maxDelayMs`, and `split` are **required**. `clientRefId` and `validator` are optional. Explicitly setting `destinationTokenAccount` to anything other than the server-derived stash ATA returns 400.",
    "method": "post",
    "name": "swap",
    "options": [
      {
        "description": "Public key of the wallet that will sign the swap transaction.",
        "flag": "--user-public-key <value>",
        "location": "body",
        "name": "userPublicKey",
        "optionKey": "userPublicKey",
        "required": true,
        "type": "string"
      },
      {
        "description": "Optional fee payer for transaction fees and rent.",
        "flag": "--payer <value>",
        "location": "body",
        "name": "payer",
        "optionKey": "payer",
        "required": false,
        "type": "string"
      },
      {
        "description": "Automatically wrap and unwrap native SOL when needed.",
        "flag": "--wrap-and-unwrap-sol <value>",
        "location": "body",
        "name": "wrapAndUnwrapSol",
        "optionKey": "wrapAndUnwrapSol",
        "required": false,
        "type": "boolean"
      },
      {
        "description": "Allow shared accounts for intermediate routing state.",
        "flag": "--use-shared-accounts <value>",
        "location": "body",
        "name": "useSharedAccounts",
        "optionKey": "useSharedAccounts",
        "required": false,
        "type": "boolean"
      },
      {
        "description": "Optional initialized token account used to collect platform fees.",
        "flag": "--fee-account <value>",
        "location": "body",
        "name": "feeAccount",
        "optionKey": "feeAccount",
        "required": false,
        "type": "string"
      },
      {
        "description": "Optional public key used for downstream transaction tracking.",
        "flag": "--tracking-account <value>",
        "location": "body",
        "name": "trackingAccount",
        "optionKey": "trackingAccount",
        "required": false,
        "type": "string"
      },
      {
        "description": "Optional priority fee configuration or fixed lamport amount.",
        "flag": "--prioritization-fee-lamports <value>",
        "location": "body",
        "minimum": 0,
        "name": "prioritizationFeeLamports",
        "optionKey": "prioritizationFeeLamports",
        "required": false,
        "type": "integer"
      },
      {
        "description": "Build a legacy transaction instead of a versioned one.",
        "flag": "--as-legacy-transaction <value>",
        "location": "body",
        "name": "asLegacyTransaction",
        "optionKey": "asLegacyTransaction",
        "required": false,
        "type": "boolean"
      },
      {
        "description": "Optional destination token account for the output mint.",
        "flag": "--destination-token-account <value>",
        "location": "body",
        "name": "destinationTokenAccount",
        "optionKey": "destinationTokenAccount",
        "required": false,
        "type": "string"
      },
      {
        "description": "Optional destination account for native SOL output.",
        "flag": "--native-destination-account <value>",
        "location": "body",
        "name": "nativeDestinationAccount",
        "optionKey": "nativeDestinationAccount",
        "required": false,
        "type": "string"
      },
      {
        "description": "Estimate compute usage and set the compute unit limit automatically.",
        "flag": "--dynamic-compute-unit-limit <value>",
        "location": "body",
        "name": "dynamicComputeUnitLimit",
        "optionKey": "dynamicComputeUnitLimit",
        "required": false,
        "type": "boolean"
      },
      {
        "description": "Skip extra RPC checks for required user accounts.",
        "flag": "--skip-user-accounts-rpc-calls <value>",
        "location": "body",
        "name": "skipUserAccountsRpcCalls",
        "optionKey": "skipUserAccountsRpcCalls",
        "required": false,
        "type": "boolean"
      },
      {
        "description": "Let the upstream swap builder overwrite slippage on the transaction.",
        "flag": "--dynamic-slippage <value>",
        "location": "body",
        "name": "dynamicSlippage",
        "optionKey": "dynamicSlippage",
        "required": false,
        "type": "boolean"
      },
      {
        "description": "Optional exact compute unit price in micro-lamports.",
        "flag": "--compute-unit-price-micro-lamports <value>",
        "location": "body",
        "minimum": 0,
        "name": "computeUnitPriceMicroLamports",
        "optionKey": "computeUnitPriceMicroLamports",
        "required": false,
        "type": "integer"
      },
      {
        "description": "Optional transaction expiry window in slots.",
        "flag": "--blockhash-slots-to-expiry <value>",
        "location": "body",
        "minimum": 0,
        "name": "blockhashSlotsToExpiry",
        "optionKey": "blockhashSlotsToExpiry",
        "required": false,
        "type": "integer"
      },
      {
        "description": "Public swap (default) proxies Jupiter/Metis as-is. `private` forces Jupiter's output into a program-owned stash ATA and appends a scheduled private transfer.",
        "enumValues": [
          "public",
          "private"
        ],
        "flag": "--visibility <value>",
        "location": "body",
        "name": "visibility",
        "optionKey": "visibility",
        "required": false,
        "type": "string"
      },
      {
        "description": "Final private-transfer recipient (wallet pubkey). Required when visibility=private.",
        "flag": "--destination <value>",
        "location": "body",
        "name": "destination",
        "optionKey": "destination",
        "required": false,
        "type": "string"
      },
      {
        "description": "Earliest (ms) the queued transfer may settle. Required when visibility=private.",
        "flag": "--min-delay-ms <value>",
        "location": "body",
        "name": "minDelayMs",
        "optionKey": "minDelayMs",
        "pattern": "^\\d+$",
        "required": false,
        "type": "string"
      },
      {
        "description": "Latest (ms) the queued transfer may settle. Required when visibility=private.",
        "flag": "--max-delay-ms <value>",
        "location": "body",
        "name": "maxDelayMs",
        "optionKey": "maxDelayMs",
        "pattern": "^\\d+$",
        "required": false,
        "type": "string"
      },
      {
        "description": "Number of queue entries to split the transfer across. Required when visibility=private. Must be between 1 and 14.",
        "flag": "--split <value>",
        "location": "body",
        "minimum": 1,
        "name": "split",
        "optionKey": "split",
        "required": false,
        "type": "integer"
      },
      {
        "description": "Optional u64 client correlation id attached to each queued split.",
        "flag": "--client-ref-id <value>",
        "location": "body",
        "name": "clientRefId",
        "optionKey": "clientRefId",
        "pattern": "^\\d+$",
        "required": false,
        "type": "string"
      },
      {
        "description": "Optional validator pubkey for the transfer-queue PDA. Defaults to the well-known MagicBlock validator.",
        "flag": "--validator <value>",
        "location": "body",
        "name": "validator",
        "optionKey": "validator",
        "required": false,
        "type": "string"
      }
    ],
    "path": "/v1/swap/swap"
  },
  {
    "description": "Transfer SPL tokens publicly or privately trough an ephemeral rollup.",
    "method": "post",
    "name": "transfer",
    "options": [
      {
        "description": "Value for from.",
        "flag": "--from <value>",
        "location": "body",
        "name": "from",
        "optionKey": "from",
        "required": true,
        "type": "string"
      },
      {
        "description": "Value for to.",
        "flag": "--to <value>",
        "location": "body",
        "name": "to",
        "optionKey": "to",
        "required": true,
        "type": "string"
      },
      {
        "description": "Optional. Use `mainnet` for BASE_RPC_URL and EPHEMERAL_RPC_URL, `devnet` for BASE_DEVNET_RPC_URL and EPHEMERAL_DEVNET_RPC_URL, or provide a custom http(s) RPC URL to override the base RPC while keeping the configured ephemeral RPC.",
        "flag": "--cluster <value>",
        "location": "body",
        "name": "cluster",
        "optionKey": "cluster",
        "required": false,
        "type": "string"
      },
      {
        "description": "Value for mint.",
        "flag": "--mint <value>",
        "location": "body",
        "name": "mint",
        "optionKey": "mint",
        "required": true,
        "type": "string"
      },
      {
        "description": "Base-unit amount as an integer JSON value with minimum 1.",
        "flag": "--amount <value>",
        "location": "body",
        "minimum": 1,
        "name": "amount",
        "optionKey": "amount",
        "required": true,
        "type": "integer"
      },
      {
        "description": "Value for visibility.",
        "enumValues": [
          "public",
          "private"
        ],
        "flag": "--visibility <value>",
        "location": "body",
        "name": "visibility",
        "optionKey": "visibility",
        "required": true,
        "type": "string"
      },
      {
        "description": "Value for fromBalance.",
        "enumValues": [
          "base",
          "ephemeral"
        ],
        "flag": "--from-balance <value>",
        "location": "body",
        "name": "fromBalance",
        "optionKey": "fromBalance",
        "required": true,
        "type": "string"
      },
      {
        "description": "Value for toBalance.",
        "enumValues": [
          "base",
          "ephemeral"
        ],
        "flag": "--to-balance <value>",
        "location": "body",
        "name": "toBalance",
        "optionKey": "toBalance",
        "required": true,
        "type": "string"
      },
      {
        "description": "Optional. When this transfer route needs a validator and none is provided, the API resolves it from the selected ephemeral RPC via `getIdentity`.",
        "flag": "--validator <value>",
        "location": "body",
        "name": "validator",
        "optionKey": "validator",
        "required": false,
        "type": "string"
      },
      {
        "description": "Value for initIfMissing.",
        "flag": "--init-if-missing <value>",
        "location": "body",
        "name": "initIfMissing",
        "optionKey": "initIfMissing",
        "required": false,
        "type": "boolean"
      },
      {
        "description": "Value for initAtasIfMissing.",
        "flag": "--init-atas-if-missing <value>",
        "location": "body",
        "name": "initAtasIfMissing",
        "optionKey": "initAtasIfMissing",
        "required": false,
        "type": "boolean"
      },
      {
        "description": "Value for initVaultIfMissing.",
        "flag": "--init-vault-if-missing <value>",
        "location": "body",
        "name": "initVaultIfMissing",
        "optionKey": "initVaultIfMissing",
        "required": false,
        "type": "boolean"
      },
      {
        "description": "Optional. Appends a final Memo Program instruction with this UTF-8 message.",
        "flag": "--memo <value>",
        "location": "body",
        "name": "memo",
        "optionKey": "memo",
        "required": false,
        "type": "string"
      },
      {
        "description": "Optional. Private transfer only. Defaults to 0.",
        "flag": "--min-delay-ms <value>",
        "location": "body",
        "name": "minDelayMs",
        "optionKey": "minDelayMs",
        "required": false,
        "type": "string"
      },
      {
        "description": "Optional. Private transfer only. Defaults to 0 when omitted, or to minDelayMs when minDelayMs is set.",
        "flag": "--max-delay-ms <value>",
        "location": "body",
        "name": "maxDelayMs",
        "optionKey": "maxDelayMs",
        "required": false,
        "type": "string"
      },
      {
        "description": "Optional. Private transfer only. Encrypted client reference ID that can be used to confirm a payment.",
        "flag": "--client-ref-id <value>",
        "location": "body",
        "name": "clientRefId",
        "optionKey": "clientRefId",
        "required": false,
        "type": "string"
      },
      {
        "description": "Optional. Private transfer only. Defaults to 1. Must be between 1 and 15.",
        "flag": "--split <value>",
        "location": "body",
        "maximum": 15,
        "minimum": 1,
        "name": "split",
        "optionKey": "split",
        "required": false,
        "type": "integer"
      },
      {
        "description": "Optional. Defaults to false. When true, skips lookup-table compilation and returns a legacy transaction.",
        "flag": "--legacy <value>",
        "location": "body",
        "name": "legacy",
        "optionKey": "legacy",
        "required": false,
        "type": "boolean"
      }
    ],
    "path": "/v1/spl/transfer"
  },
  {
    "description": "Withdraw SPL tokens from an ephemeral rollup back to Solana.",
    "method": "post",
    "name": "withdraw",
    "options": [
      {
        "description": "Value for owner.",
        "flag": "--owner <value>",
        "location": "body",
        "name": "owner",
        "optionKey": "owner",
        "required": true,
        "type": "string"
      },
      {
        "description": "Optional. Use `mainnet` for BASE_RPC_URL and EPHEMERAL_RPC_URL, `devnet` for BASE_DEVNET_RPC_URL and EPHEMERAL_DEVNET_RPC_URL, or provide a custom http(s) RPC URL to override the base RPC while keeping the configured ephemeral RPC.",
        "flag": "--cluster <value>",
        "location": "body",
        "name": "cluster",
        "optionKey": "cluster",
        "required": false,
        "type": "string"
      },
      {
        "description": "SPL mint on Solana.",
        "flag": "--mint <value>",
        "location": "body",
        "name": "mint",
        "optionKey": "mint",
        "required": true,
        "type": "string"
      },
      {
        "description": "Base-unit amount as an integer JSON value with minimum 1.",
        "flag": "--amount <value>",
        "location": "body",
        "minimum": 1,
        "name": "amount",
        "optionKey": "amount",
        "required": true,
        "type": "integer"
      },
      {
        "description": "Optional. Defaults to the selected ephemeral RPC identity resolved via `getIdentity`.",
        "flag": "--validator <value>",
        "location": "body",
        "name": "validator",
        "optionKey": "validator",
        "required": false,
        "type": "string"
      },
      {
        "description": "Value for initIfMissing.",
        "flag": "--init-if-missing <value>",
        "location": "body",
        "name": "initIfMissing",
        "optionKey": "initIfMissing",
        "required": false,
        "type": "boolean"
      },
      {
        "description": "Value for initAtasIfMissing.",
        "flag": "--init-atas-if-missing <value>",
        "location": "body",
        "name": "initAtasIfMissing",
        "optionKey": "initAtasIfMissing",
        "required": false,
        "type": "boolean"
      },
      {
        "description": "Value for escrowIndex.",
        "flag": "--escrow-index <value>",
        "location": "body",
        "minimum": 0,
        "name": "escrowIndex",
        "optionKey": "escrowIndex",
        "required": false,
        "type": "integer"
      },
      {
        "description": "Value for idempotent.",
        "flag": "--idempotent <value>",
        "location": "body",
        "name": "idempotent",
        "optionKey": "idempotent",
        "required": false,
        "type": "boolean"
      }
    ],
    "path": "/v1/spl/withdraw"
  }
];

export function getGeneratedCommand(name: string): GeneratedCommandSpec | undefined {
  return generatedCommands.find((command) => command.name === name);
}
