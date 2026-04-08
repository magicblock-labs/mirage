import { Command } from "commander";

import packageJson from "../package.json" with { type: "json" };
import { registerApiCommand } from "./commands/api.js";
import { registerAddressCommand } from "./commands/address.js";
import { registerBalanceCommand } from "./commands/balance.js";
import { registerConfigCommand } from "./commands/config.js";
import { registerFundCommand } from "./commands/fund.js";
import { registerOwsCommand } from "./commands/ows.js";
import { registerTransferCommand } from "./commands/transfer.js";

export function createProgram(): Command {
  const program = new Command();

  program
    .name("mirage")
    .description("MagicBlock payments CLI with bundled Open Wallet Standard access.")
    .version(packageJson.version)
    .showHelpAfterError()
    .showSuggestionAfterError();

  registerBalanceCommand(program);
  registerAddressCommand(program);
  registerFundCommand(program);
  registerTransferCommand(program);
  registerApiCommand(program);
  registerConfigCommand(program);
  registerOwsCommand(program);

  program.addHelpText(
    "after",
    [
      "",
      "Examples:",
      "  mirage balance",
      "  mirage address --wallet agent-treasury-1",
      "  mirage fund --wallet agent-treasury-1",
      "  mirage transfer --wallet agent-treasury --to Bt9oNR5cCtnfuMmXgWELd6q5i974PdEMQDUE55nBC57L --mint EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --amount 1000000",
      "  mirage config set-rpc https://api.mainnet-beta.solana.com",
      '  mirage ows sign message --wallet agent-treasury --chain solana --message "hello"',
    ].join("\n"),
  );

  return program;
}
