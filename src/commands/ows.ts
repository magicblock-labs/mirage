import type { Command } from "commander";

export function registerOwsCommand(program: Command): void {
  program
    .command("ows [args...]")
    .description("Pass through to the bundled Open Wallet Standard CLI.");
}
