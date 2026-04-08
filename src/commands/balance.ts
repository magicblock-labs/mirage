import type { Command } from "commander";

import {
  DEFAULT_BALANCE_WALLET,
  executeBalance,
} from "../lib/balance.js";

export function registerBalanceCommand(program: Command): void {
  program
    .command("balance")
    .description("Show the Solana balance for an OWS wallet.")
    .option(
      "--wallet <wallet>",
      "OWS wallet name or ID.",
      DEFAULT_BALANCE_WALLET,
    )
    .action(async (options: { wallet: string }) => {
      await executeBalance({
        wallet: options.wallet,
      });
    });
}
