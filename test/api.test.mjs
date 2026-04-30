import assert from "node:assert/strict";
import test from "node:test";

import { createProgram } from "../dist/index.js";
import { getGeneratedCommand } from "../dist/generated/payments-cli.js";

test("generated private-balance command exposes authorization header", () => {
  const command = getGeneratedCommand("private-balance");
  const authorization = command.options.find((option) => option.name === "authorization");

  assert.equal(authorization.location, "header");
  assert.equal(authorization.required, true);
});

test("api command sends generated header options as request headers", async () => {
  const originalFetch = globalThis.fetch;
  const originalLog = console.log;
  const calls = {};

  globalThis.fetch = async (url, init) => {
    calls.url = String(url);
    calls.headers = init.headers;

    return new Response(JSON.stringify({ balance: "0" }), {
      headers: {
        "content-type": "application/json",
      },
      status: 200,
    });
  };
  console.log = () => {};

  try {
    const program = createProgram();
    await program.parseAsync([
      "node",
      "mirage",
      "api",
      "private-balance",
      "--address",
      "Address111111111111111111111111111111111111",
      "--mint",
      "Mint1111111111111111111111111111111111111111",
      "--authorization",
      "Bearer token",
      "--api-base-url",
      "https://payments.example.com",
    ]);
  } finally {
    globalThis.fetch = originalFetch;
    console.log = originalLog;
  }

  assert.equal(
    calls.url,
    "https://payments.example.com/v1/spl/private-balance?address=Address111111111111111111111111111111111111&mint=Mint1111111111111111111111111111111111111111",
  );
  assert.equal(calls.headers.authorization, "Bearer token");
  assert.equal(calls.headers.Accept, "application/json");
});
