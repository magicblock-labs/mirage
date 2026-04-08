import type { Command } from "commander";

import {
  executeAddress,
} from "../lib/address.js";
import { DEFAULT_OWS_WALLET } from "../lib/default-wallet.js";

export function registerAddressCommand(program: Command): void {
  program
    .command("address")
    .description("Show the Solana public key for an OWS wallet.")
    .option(
      "--wallet <wallet>",
      "OWS wallet name or ID.",
      DEFAULT_OWS_WALLET,
    )
    .action(async (options: { wallet: string }) => {
      const address = await executeAddress({
        wallet: options.wallet,
      });

      console.log(address);
    });
}
