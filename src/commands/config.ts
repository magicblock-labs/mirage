import type { Command } from "commander";

import {
  clearRpcUrl,
  getConfigPath,
  readConfig,
  setRpcUrl,
} from "../lib/config.js";

export function registerConfigCommand(program: Command): void {
  const config = program
    .command("config")
    .description("Inspect and update the shared OWS configuration used by Mirage.");

  config
    .command("get")
    .description("Print the current configuration.")
    .option("--json", "Output machine-readable JSON.")
    .action(async (options: { json?: boolean }) => {
      const current = await readConfig();

      if (options.json) {
        console.log(
          JSON.stringify(
            {
              path: getConfigPath(),
              ...current,
            },
            null,
            2,
          ),
        );
        return;
      }

      console.log(`Config path: ${getConfigPath()}`);
      console.log(`Solana RPC override: ${current.rpcUrl ?? "not set (using OWS default)"}`);
    });

  config
    .command("path")
    .description("Print the config file path.")
    .action(() => {
      console.log(getConfigPath());
    });

  config
    .command("set-rpc")
    .description("Set the default Solana RPC URL in OWS config for Mirage transfers.")
    .argument("<url>", "HTTP(S) RPC URL")
    .action(async (url: string) => {
      const next = await setRpcUrl(url);
      console.log(`Default RPC set to ${next.rpcUrl}.`);
    });

  config
    .command("clear-rpc")
    .description("Clear the custom Solana RPC URL from OWS config.")
    .action(async () => {
      await clearRpcUrl();
      console.log("Default RPC cleared.");
    });
}
