const SUPPRESSED_DEPRECATION_CODES = new Set(["DEP0040"]);

const originalEmit = process.emit;

process.emit = function patchedEmit(
  event: string | symbol,
  ...args: unknown[]
): boolean {
  if (event === "warning") {
    const warning = args[0] as { code?: string; name?: string } | undefined;

    if (
      warning?.name === "DeprecationWarning" &&
      warning.code !== undefined &&
      SUPPRESSED_DEPRECATION_CODES.has(warning.code)
    ) {
      return false;
    }
  }

  return (originalEmit as (event: string | symbol, ...args: unknown[]) => boolean).call(
    process,
    event,
    ...args,
  );
} as typeof process.emit;
