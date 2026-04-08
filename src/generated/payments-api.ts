/*
 * This file is generated from the checked-in MagicBlock payments OpenAPI schema.
 * Do not edit it by hand. Run `npm run generate` instead.
 */
export interface paths {
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Health check */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["HealthResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/spl/deposit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Deposit SPL tokens from Solana into an ephemeral rollup. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Deposit request */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["DepositRequest"];
                };
            };
            responses: {
                /** @description Unsigned serialized transaction */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "kind": "deposit",
                         *       "version": "legacy",
                         *       "transactionBase64": "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAIDKmcfsS5XfSOLaLlaBHJry50iH2Ufk2TMz4STC2fHzIcFKkerg3q2DD3Yn8TISmGeKoxSLz+BiP7iQ4pYqXYXsgu8D8C7R8ovdMQRLpSrE8+jxjTl3BfqywPNGiPNfnh8eS+smowIxqKDcCjw5liNXQkkCbBSDCBDFwtrgCKqoQ0DAgEBBAECAwQCAQEEAgIDBAIBAQQDAgME",
                         *       "sendTo": "base",
                         *       "recentBlockhash": "9A4VhP8M8fQZxP4h7rB6mP6eM8w2pJkYh7QdZk7V4r2x",
                         *       "lastValidBlockHeight": 284512337,
                         *       "instructionCount": 3,
                         *       "requiredSigners": [
                         *         "3rXKwQ1kpjBd5tdcco32qsvqUh1BnZjcYnS5kYrP7AYE"
                         *       ],
                         *       "validator": "MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57"
                         *     }
                         */
                        "application/json": components["schemas"]["UnsignedTransactionResponse"];
                    };
                };
                /** @description Build error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Validation error */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ValidationErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/spl/withdraw": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Withdraw SPL tokens from an ephemeral rollup back to Solana. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Withdraw request */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["WithdrawRequest"];
                };
            };
            responses: {
                /** @description Unsigned serialized transaction */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "kind": "withdraw",
                         *       "version": "legacy",
                         *       "transactionBase64": "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAIDKmcfsS5XfSOLaLlaBHJry50iH2Ufk2TMz4STC2fHzIcFKkerg3q2DD3Yn8TISmGeKoxSLz+BiP7iQ4pYqXYXsgu8D8C7R8ovdMQRLpSrE8+jxjTl3BfqywPNGiPNfnh8AazZ0ixOauLjpxaRgDCv6MChaoMAZAJg8BnPbZl31jECAgEBBAECAwQCAQEEAgIDBA==",
                         *       "sendTo": "base",
                         *       "recentBlockhash": "7YH7nE6qj8vH3L9pR5uM2cD1xK4sT8wQ6bN3fJ2mP9z",
                         *       "lastValidBlockHeight": 284512451,
                         *       "instructionCount": 2,
                         *       "requiredSigners": [
                         *         "3rXKwQ1kpjBd5tdcco32qsvqUh1BnZjcYnS5kYrP7AYE"
                         *       ],
                         *       "validator": "MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57"
                         *     }
                         */
                        "application/json": components["schemas"]["UnsignedTransactionResponse"];
                    };
                };
                /** @description Build error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Validation error */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ValidationErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/spl/initialize-mint": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Build an unsigned base-chain transaction that initializes and delegates a validator-scoped transfer queue for a mint. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Initialize mint request */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["InitializeMintRequest"];
                };
            };
            responses: {
                /** @description Unsigned serialized transaction */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "kind": "initializeMint",
                         *       "version": "legacy",
                         *       "transactionBase64": "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAIDKmcfsS5XfSOLaLlaBHJry50iH2Ufk2TMz4STC2fHzIcFKkerg3q2DD3Yn8TISmGeKoxSLz+BiP7iQ4pYqXYXsgu8D8C7R8ovdMQRLpSrE8+jxjTl3BfqywPNGiPNfnh8eS+smowIxqKDcCjw5liNXQkkCbBSDCBDFwtrgCKqoQ0DAgEBBAECAwQCAQEEAgIDBAIBAQQDAgME",
                         *       "sendTo": "base",
                         *       "recentBlockhash": "9A4VhP8M8fQZxP4h7rB6mP6eM8w2pJkYh7QdZk7V4r2x",
                         *       "lastValidBlockHeight": 284512337,
                         *       "instructionCount": 7,
                         *       "requiredSigners": [
                         *         "3rXKwQ1kpjBd5tdcco32qsvqUh1BnZjcYnS5kYrP7AYE"
                         *       ],
                         *       "validator": "MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57",
                         *       "transferQueue": "BuBHLbaPmYmgvMiZ8uZb96RjBtmWzJY52u7Di5urNf6M",
                         *       "rentPda": "Bt9oNR5cCtnfuMmXgWELd6q5i974PdEMQDUE55nBC57L"
                         *     }
                         */
                        "application/json": components["schemas"]["InitializeMintResponse"];
                    };
                };
                /** @description Build error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Validation error */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ValidationErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/spl/transfer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Transfer SPL tokens publicly or privately trough an ephemeral rollup. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Transfer request */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["TransferRequest"];
                };
            };
            responses: {
                /** @description Unsigned serialized transaction */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["UnsignedTransactionResponse"];
                    };
                };
                /** @description Build error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Validation error */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ValidationErrorResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/spl/balance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Get the balance for the owner's ATA on the base RPC. */
        get: {
            parameters: {
                query: {
                    address: string;
                    /** @description Optional. Use `mainnet` for BASE_RPC_URL and EPHEMERAL_RPC_URL, `devnet` for BASE_DEVNET_RPC_URL and EPHEMERAL_DEVNET_RPC_URL, or provide a custom http(s) RPC URL to override the base RPC while keeping the configured ephemeral RPC. */
                    cluster?: ("mainnet" | "devnet") | string;
                    mint: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Base-chain token balance */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "address": "Bt9oNR5cCtnfuMmXgWELd6q5i974PdEMQDUE55nBC57L",
                         *       "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                         *       "ata": "3rXKwQ1kpjBd5tdcco32qsvqUh1BnZjcYnS5kYrP7AYE",
                         *       "location": "base",
                         *       "balance": "1000000"
                         *     }
                         */
                        "application/json": components["schemas"]["BalanceResponse"];
                    };
                };
                /** @description Query error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Validation error */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ValidationErrorResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/spl/private-balance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Get the balance for the owner's ATA on the ephemeral RPC. */
        get: {
            parameters: {
                query: {
                    address: string;
                    /** @description Optional. Use `mainnet` for BASE_RPC_URL and EPHEMERAL_RPC_URL, `devnet` for BASE_DEVNET_RPC_URL and EPHEMERAL_DEVNET_RPC_URL, or provide a custom http(s) RPC URL to override the base RPC while keeping the configured ephemeral RPC. */
                    cluster?: ("mainnet" | "devnet") | string;
                    mint: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Ephemeral token balance */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "address": "Bt9oNR5cCtnfuMmXgWELd6q5i974PdEMQDUE55nBC57L",
                         *       "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                         *       "ata": "3rXKwQ1kpjBd5tdcco32qsvqUh1BnZjcYnS5kYrP7AYE",
                         *       "location": "ephemeral",
                         *       "balance": "1000000"
                         *     }
                         */
                        "application/json": components["schemas"]["BalanceResponse"];
                    };
                };
                /** @description Query error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Validation error */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ValidationErrorResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/spl/is-mint-initialized": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Check whether the validator-scoped transfer queue exists for a mint on the ephemeral RPC. */
        get: {
            parameters: {
                query: {
                    mint: string;
                    /** @description Optional. Use `mainnet` for BASE_RPC_URL and EPHEMERAL_RPC_URL, `devnet` for BASE_DEVNET_RPC_URL and EPHEMERAL_DEVNET_RPC_URL, or provide a custom http(s) RPC URL to override the base RPC while keeping the configured ephemeral RPC. */
                    cluster?: ("mainnet" | "devnet") | string;
                    /** @description Optional. Defaults to the selected ephemeral RPC identity resolved via `getIdentity`. */
                    validator?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Mint transfer queue initialization status */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                         *       "validator": "MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57",
                         *       "transferQueue": "BuBHLbaPmYmgvMiZ8uZb96RjBtmWzJY52u7Di5urNf6M",
                         *       "initialized": true
                         *     }
                         */
                        "application/json": components["schemas"]["MintInitializationResponse"];
                    };
                };
                /** @description Query error */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
                /** @description Validation error */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ValidationErrorResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/mcp": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * @description Stateless Streamable HTTP MCP endpoint.
         *
         *     Implementation details:
         *     - Each `POST /mcp` request creates a fresh `McpServer`, handles the JSON-RPC exchange, then closes it.
         *     - The transport runs with `sessionIdGenerator: undefined` and `enableJsonResponse: true`, so this server does not issue or require `mcp-session-id` headers.
         *     - `GET /mcp` returns the info document and `GET /.well-known/mcp.json` returns the discovery document.
         *     - Clients can use `Accept: application/json` with `Content-Type: application/json`.
         *
         *     Typical flow:
         *     1. `initialize`
         *     2. `notifications/initialized`
         *     3. `tools/list` or `tools/call`
         *
         *     Initialize request example:
         *     ```json
         *     {
         *       "jsonrpc": "2.0",
         *       "id": 1,
         *       "method": "initialize",
         *       "params": {
         *         "protocolVersion": "2025-11-25",
         *         "capabilities": {},
         *         "clientInfo": {
         *           "name": "curl-example",
         *           "version": "1.0.0"
         *         }
         *       }
         *     }
         *     ```
         *
         *     Initialize response example:
         *     ```json
         *     {
         *       "jsonrpc": "2.0",
         *       "id": 1,
         *       "result": {
         *         "protocolVersion": "2025-11-25",
         *         "capabilities": {
         *           "tools": {
         *             "listChanged": true
         *           }
         *         },
         *         "serverInfo": {
         *           "name": "spl-private-payments-api",
         *           "version": "0.1.0"
         *         }
         *       }
         *     }
         *     ```
         *
         *     Tool call request example:
         *     ```json
         *     {
         *       "jsonrpc": "2.0",
         *       "id": 3,
         *       "method": "tools/call",
         *       "params": {
         *         "name": "spl.deposit",
         *         "arguments": {
         *           "owner": "3rXKwQ1kpjBd5tdcco32qsvqUh1BnZjcYnS5kYrP7AYE",
         *           "amount": 1,
         *           "initIfMissing": true,
         *           "initAtasIfMissing": true,
         *           "initVaultIfMissing": false,
         *           "idempotent": true
         *         }
         *       }
         *     }
         *     ```
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description MCP JSON-RPC request */
            requestBody: {
                content: {
                    /**
                     * @example {
                     *       "jsonrpc": "2.0",
                     *       "id": 1,
                     *       "method": "initialize",
                     *       "params": {
                     *         "protocolVersion": "2025-11-25",
                     *         "capabilities": {},
                     *         "clientInfo": {
                     *           "name": "curl-example",
                     *           "version": "1.0.0"
                     *         }
                     *       }
                     *     }
                     */
                    "application/json": {
                        /** @enum {string} */
                        jsonrpc: "2.0";
                        id?: string | number | null;
                        method: string;
                        params?: unknown;
                    } & {
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                /** @description MCP JSON-RPC response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "jsonrpc": "2.0",
                         *       "id": 3,
                         *       "result": {
                         *         "content": [
                         *           {
                         *             "type": "text",
                         *             "text": "Built an unsigned SPL deposit transaction."
                         *           }
                         *         ],
                         *         "structuredContent": {
                         *           "kind": "deposit",
                         *           "version": "legacy",
                         *           "transactionBase64": "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAIDKmcfsS5XfSOLaLlaBHJry50iH2Ufk2TMz4STC2fHzIcFKkerg3q2DD3Yn8TISmGeKoxSLz+BiP7iQ4pYqXYXsgu8D8C7R8ovdMQRLpSrE8+jxjTl3BfqywPNGiPNfnh8eS+smowIxqKDcCjw5liNXQkkCbBSDCBDFwtrgCKqoQ0DAgEBBAECAwQCAQEEAgIDBAIBAQQDAgME",
                         *           "sendTo": "base",
                         *           "recentBlockhash": "9A4VhP8M8fQZxP4h7rB6mP6eM8w2pJkYh7QdZk7V4r2x",
                         *           "lastValidBlockHeight": 284512337,
                         *           "instructionCount": 3,
                         *           "requiredSigners": [
                         *             "3rXKwQ1kpjBd5tdcco32qsvqUh1BnZjcYnS5kYrP7AYE"
                         *           ],
                         *           "validator": "MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57"
                         *         }
                         *       }
                         *     }
                         */
                        "application/json": components["schemas"]["McpResponse"];
                    };
                };
                /** @description Notification accepted; no response body is returned. */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Invalid JSON or invalid JSON-RPC request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "jsonrpc": "2.0",
                         *       "error": {
                         *         "code": -32700,
                         *         "message": "Parse error"
                         *       },
                         *       "id": null
                         *     }
                         */
                        "application/json": components["schemas"]["McpResponse"];
                    };
                };
                /** @description Content-Type must be application/json */
                415: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "jsonrpc": "2.0",
                         *       "error": {
                         *         "code": -32000,
                         *         "message": "Unsupported Media Type: Content-Type must be application/json"
                         *       },
                         *       "id": null
                         *     }
                         */
                        "application/json": components["schemas"]["McpResponse"];
                    };
                };
                /** @description MCP JSON-RPC error response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "jsonrpc": "2.0",
                         *       "error": {
                         *         "code": -32603,
                         *         "message": "Internal server error"
                         *       },
                         *       "id": null
                         *     }
                         */
                        "application/json": components["schemas"]["McpResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        HealthResponse: {
            /** @enum {string} */
            status: "ok";
        };
        UnsignedTransactionResponse: {
            /** @enum {string} */
            kind: "deposit" | "withdraw" | "transfer";
            /** @enum {string} */
            version: "legacy";
            transactionBase64: string;
            sendTo: components["schemas"]["BalanceLocation"];
            recentBlockhash: string;
            lastValidBlockHeight: number;
            instructionCount: number;
            requiredSigners: string[];
            /** @example So11111111111111111111111111111111111111112 */
            validator?: string;
        };
        /** @enum {string} */
        BalanceLocation: "base" | "ephemeral";
        ErrorResponse: {
            error: {
                code: string;
                message: string;
                details?: unknown;
            };
        };
        ValidationErrorResponse: {
            error: {
                /** @enum {string} */
                code: "VALIDATION_ERROR";
                message: string;
                issues: {
                    code: string;
                    message: string;
                    path: (string | number)[];
                }[];
            };
        };
        /**
         * @example {
         *       "owner": "3rXKwQ1kpjBd5tdcco32qsvqUh1BnZjcYnS5kYrP7AYE",
         *       "amount": 1,
         *       "initIfMissing": true,
         *       "initVaultIfMissing": false,
         *       "initAtasIfMissing": true,
         *       "idempotent": true
         *     }
         */
        DepositRequest: {
            /** @example 3rXKwQ1kpjBd5tdcco32qsvqUh1BnZjcYnS5kYrP7AYE */
            owner: string;
            /**
             * @description Optional. Use `mainnet` for BASE_RPC_URL and EPHEMERAL_RPC_URL, `devnet` for BASE_DEVNET_RPC_URL and EPHEMERAL_DEVNET_RPC_URL, or provide a custom http(s) RPC URL to override the base RPC while keeping the configured ephemeral RPC.
             * @example mainnet
             */
            cluster?: ("mainnet" | "devnet") | string;
            /**
             * @description Optional. Defaults to Solana USDC on mainnet: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v. On devnet it defaults to devnet USDC: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU.
             * @example EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
             */
            mint?: string;
            /**
             * @description Base-unit amount as an integer JSON value with minimum 1.
             * @example 1
             */
            amount: number;
            /**
             * @description Optional. Defaults to the selected ephemeral RPC identity resolved via `getIdentity`.
             * @example MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57
             */
            validator?: string;
            initIfMissing?: boolean;
            initVaultIfMissing?: boolean;
            initAtasIfMissing?: boolean;
            idempotent?: boolean;
        };
        /**
         * @example {
         *       "owner": "3rXKwQ1kpjBd5tdcco32qsvqUh1BnZjcYnS5kYrP7AYE",
         *       "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
         *       "amount": 1000000,
         *       "idempotent": true
         *     }
         */
        WithdrawRequest: {
            /** @example 3rXKwQ1kpjBd5tdcco32qsvqUh1BnZjcYnS5kYrP7AYE */
            owner: string;
            /**
             * @description Optional. Use `mainnet` for BASE_RPC_URL and EPHEMERAL_RPC_URL, `devnet` for BASE_DEVNET_RPC_URL and EPHEMERAL_DEVNET_RPC_URL, or provide a custom http(s) RPC URL to override the base RPC while keeping the configured ephemeral RPC.
             * @example mainnet
             */
            cluster?: ("mainnet" | "devnet") | string;
            /**
             * @description SPL mint on Solana.
             * @example EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
             */
            mint: string;
            /**
             * @description Base-unit amount as an integer JSON value with minimum 1.
             * @example 1000000
             */
            amount: number;
            /**
             * @description Optional. Defaults to the selected ephemeral RPC identity resolved via `getIdentity`.
             * @example MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57
             */
            validator?: string;
            initIfMissing?: boolean;
            initAtasIfMissing?: boolean;
            escrowIndex?: number;
            idempotent?: boolean;
        };
        InitializeMintResponse: components["schemas"]["UnsignedTransactionResponse"] & {
            /** @enum {string} */
            kind?: "initializeMint";
            /** @example So11111111111111111111111111111111111111112 */
            transferQueue: string;
            /** @example So11111111111111111111111111111111111111112 */
            rentPda: string;
        };
        /**
         * @example {
         *       "payer": "3rXKwQ1kpjBd5tdcco32qsvqUh1BnZjcYnS5kYrP7AYE",
         *       "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
         *       "validator": "MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57"
         *     }
         */
        InitializeMintRequest: {
            /** @example 3rXKwQ1kpjBd5tdcco32qsvqUh1BnZjcYnS5kYrP7AYE */
            payer: string;
            /** @example EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v */
            mint: string;
            /**
             * @description Optional. Use `mainnet` for BASE_RPC_URL and EPHEMERAL_RPC_URL, `devnet` for BASE_DEVNET_RPC_URL and EPHEMERAL_DEVNET_RPC_URL, or provide a custom http(s) RPC URL to override the base RPC while keeping the configured ephemeral RPC.
             * @example mainnet
             */
            cluster?: ("mainnet" | "devnet") | string;
            /**
             * @description Optional. Defaults to the selected ephemeral RPC identity resolved via `getIdentity`.
             * @example MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57
             */
            validator?: string;
        };
        /**
         * @example {
         *       "from": "3rXKwQ1kpjBd5tdcco32qsvqUh1BnZjcYnS5kYrP7AYE",
         *       "to": "Bt9oNR5cCtnfuMmXgWELd6q5i974PdEMQDUE55nBC57L",
         *       "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
         *       "amount": 1000000,
         *       "visibility": "private",
         *       "fromBalance": "base",
         *       "toBalance": "base",
         *       "initIfMissing": true,
         *       "initAtasIfMissing": true,
         *       "initVaultIfMissing": false,
         *       "memo": "Order #1042",
         *       "minDelayMs": "0",
         *       "maxDelayMs": "0",
         *       "clientRefId": "42",
         *       "split": 1
         *     }
         */
        TransferRequest: {
            /** @example So11111111111111111111111111111111111111112 */
            from: string;
            /** @example So11111111111111111111111111111111111111112 */
            to: string;
            /**
             * @description Optional. Use `mainnet` for BASE_RPC_URL and EPHEMERAL_RPC_URL, `devnet` for BASE_DEVNET_RPC_URL and EPHEMERAL_DEVNET_RPC_URL, or provide a custom http(s) RPC URL to override the base RPC while keeping the configured ephemeral RPC.
             * @example mainnet
             */
            cluster?: ("mainnet" | "devnet") | string;
            /** @example So11111111111111111111111111111111111111112 */
            mint: string;
            /**
             * @description Base-unit amount as an integer JSON value with minimum 1.
             * @example 1000000
             */
            amount: number;
            visibility: components["schemas"]["TransferVisibility"];
            fromBalance: components["schemas"]["BalanceLocation"];
            toBalance: components["schemas"]["BalanceLocation"];
            /**
             * @description Optional. When this transfer route needs a validator and none is provided, the API resolves it from the selected ephemeral RPC via `getIdentity`.
             * @example MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57
             */
            validator?: string;
            initIfMissing?: boolean;
            initAtasIfMissing?: boolean;
            initVaultIfMissing?: boolean;
            /**
             * @description Optional. Appends a final Memo Program instruction with this UTF-8 message.
             * @example Order #1042
             */
            memo?: string;
            /**
             * @description Optional. Private transfer only. Defaults to 0.
             * @example 0
             */
            minDelayMs?: string;
            /**
             * @description Optional. Private transfer only. Defaults to 0 when omitted, or to minDelayMs when minDelayMs is set.
             * @example 0
             */
            maxDelayMs?: string;
            /**
             * @description Optional. Private transfer only. Encrypted client reference ID that can be used to confirm a payment.
             * @example 42
             */
            clientRefId?: string;
            /**
             * @description Optional. Private transfer only. Defaults to 1. Must be between 1 and 15.
             * @example 1
             */
            split?: number;
        };
        /** @enum {string} */
        TransferVisibility: "public" | "private";
        BalanceResponse: {
            /** @example So11111111111111111111111111111111111111112 */
            address: string;
            /** @example So11111111111111111111111111111111111111112 */
            mint: string;
            /** @example So11111111111111111111111111111111111111112 */
            ata: string;
            location: components["schemas"]["BalanceLocation"];
            balance: string;
        };
        MintInitializationResponse: {
            /** @example So11111111111111111111111111111111111111112 */
            mint: string;
            /** @example So11111111111111111111111111111111111111112 */
            validator: string;
            /** @example So11111111111111111111111111111111111111112 */
            transferQueue: string;
            initialized: boolean;
        };
        /**
         * @example {
         *       "jsonrpc": "2.0",
         *       "id": 3,
         *       "result": {
         *         "content": [
         *           {
         *             "type": "text",
         *             "text": "Built an unsigned SPL deposit transaction."
         *           }
         *         ],
         *         "structuredContent": {
         *           "kind": "deposit",
         *           "version": "legacy",
         *           "transactionBase64": "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAIDKmcfsS5XfSOLaLlaBHJry50iH2Ufk2TMz4STC2fHzIcFKkerg3q2DD3Yn8TISmGeKoxSLz+BiP7iQ4pYqXYXsgu8D8C7R8ovdMQRLpSrE8+jxjTl3BfqywPNGiPNfnh8eS+smowIxqKDcCjw5liNXQkkCbBSDCBDFwtrgCKqoQ0DAgEBBAECAwQCAQEEAgIDBAIBAQQDAgME",
         *           "sendTo": "base",
         *           "recentBlockhash": "9A4VhP8M8fQZxP4h7rB6mP6eM8w2pJkYh7QdZk7V4r2x",
         *           "lastValidBlockHeight": 284512337,
         *           "instructionCount": 3,
         *           "requiredSigners": [
         *             "3rXKwQ1kpjBd5tdcco32qsvqUh1BnZjcYnS5kYrP7AYE"
         *           ],
         *           "validator": "MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57"
         *         }
         *       }
         *     }
         */
        McpResponse: {
            /** @enum {string} */
            jsonrpc: "2.0";
            id?: string | number | null;
            result?: unknown;
            error?: {
                code: number;
                message: string;
            } & {
                [key: string]: unknown;
            };
        } & {
            [key: string]: unknown;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
