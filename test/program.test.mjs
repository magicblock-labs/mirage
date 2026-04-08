import assert from "node:assert/strict";
import test from "node:test";

import { createProgram } from "../dist/index.js";

test("program registers generated api commands", () => {
  const program = createProgram();
  const addressCommand = program.commands.find((command) => command.name() === "address");
  const balanceCommand = program.commands.find((command) => command.name() === "balance");
  const fundCommand = program.commands.find((command) => command.name() === "fund");
  const apiCommand = program.commands.find((command) => command.name() === "api");

  assert.ok(addressCommand, "expected an `address` command to be registered");
  assert.ok(balanceCommand, "expected a `balance` command to be registered");
  assert.ok(fundCommand, "expected a `fund` command to be registered");
  assert.ok(apiCommand, "expected an `api` command to be registered");

  const generatedSubcommands = apiCommand.commands.map((command) => command.name());

  assert.ok(generatedSubcommands.includes("transfer"));
  assert.ok(generatedSubcommands.includes("deposit"));
  assert.ok(generatedSubcommands.includes("withdraw"));
});
