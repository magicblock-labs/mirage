import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const sourceArgument = process.argv[2];

if (!sourceArgument) {
  console.error("Usage: npm run openapi:update -- <path-to-openapi-json>");
  process.exit(1);
}

const sourcePath = resolve(process.cwd(), sourceArgument);
const targetPath = resolve(rootDir, "openapi/payments.openapi.json");

await mkdir(dirname(targetPath), { recursive: true });
await copyFile(sourcePath, targetPath);

execFileSync(
  process.execPath,
  [resolve(rootDir, "scripts/sync-openapi.mjs"), "./openapi/payments.openapi.json"],
  {
    cwd: rootDir,
    stdio: "inherit",
  },
);
