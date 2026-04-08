#!/usr/bin/env node

import { createProgram } from "./program.js";
import { MirageError, formatError } from "./lib/errors.js";
import { runOwsCli } from "./lib/ows.js";

async function main(): Promise<void> {
  const [, , ...args] = process.argv;

  if (args[0] === "ows") {
    const exitCode = await runOwsCli(args.slice(1));
    process.exit(exitCode);
  }

  const program = createProgram();

  if (args.length === 0) {
    program.outputHelp();
    return;
  }

  await program.parseAsync(process.argv);
}

main().catch((error: unknown) => {
  console.error(formatError(error));
  process.exit(error instanceof MirageError ? error.exitCode : 1);
});
