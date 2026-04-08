import type { Command } from "commander";

import { DEFAULT_OWS_WALLET } from "../lib/default-wallet.js";
import { executeFund } from "../lib/fund.js";

export function registerFundCommand(program: Command): void {
  program
    .command("fund")
    .description("Open MagicBlock One with the selected OWS wallet Solana address as `rcv`.")
    .option(
      "--wallet <wallet>",
      "OWS wallet name or ID.",
      DEFAULT_OWS_WALLET,
    )
    .action(async (options: { wallet: string }) => {
      await executeFund({
        wallet: options.wallet,
      });
    });
}
