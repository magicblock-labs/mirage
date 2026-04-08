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
        "description": "Optional. Use `mainnet` for BASE_RPC_URL and EPHEMERAL_RPC_URL, `devnet` for BASE_DEVNET_RPC_URL and EPHEMERAL_DEVNET_RPC_URL, or provide a custom http(s) RPC URL to override the base RPC while keeping the configured ephemeral RPC.",
        "flag": "--cluster <value>",
        "location": "query",
        "name": "cluster",
        "optionKey": "cluster",
        "required": false,
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
      }
    ],
    "path": "/v1/spl/balance"
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
        "description": "Optional. Use `mainnet` for BASE_RPC_URL and EPHEMERAL_RPC_URL, `devnet` for BASE_DEVNET_RPC_URL and EPHEMERAL_DEVNET_RPC_URL, or provide a custom http(s) RPC URL to override the base RPC while keeping the configured ephemeral RPC.",
        "flag": "--cluster <value>",
        "location": "query",
        "name": "cluster",
        "optionKey": "cluster",
        "required": false,
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
      }
    ],
    "path": "/v1/spl/private-balance"
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
