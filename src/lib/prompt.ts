export async function promptSecret(prompt: string): Promise<string | undefined> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return undefined;
  }

  return await new Promise<string | undefined>((resolve, reject) => {
    const input = process.stdin;
    const output = process.stdout;
    const wasRaw = input.isRaw;
    let value = "";

    const cleanup = () => {
      input.off("data", onData);
      input.setRawMode?.(Boolean(wasRaw));
      input.pause();
    };

    const finish = (nextValue?: string) => {
      cleanup();
      output.write("\n");
      resolve(nextValue);
    };

    const fail = (error: Error) => {
      cleanup();
      output.write("\n");
      reject(error);
    };

    const onData = (chunk: string) => {
      for (const character of chunk) {
        if (character === "\r" || character === "\n") {
          finish(value);
          return;
        }

        if (character === "\u0003") {
          fail(new Error("Passphrase prompt cancelled."));
          return;
        }

        if (character === "\u007f") {
          value = value.slice(0, -1);
          continue;
        }

        value += character;
      }
    };

    output.write(prompt);
    input.setEncoding("utf8");
    input.setRawMode?.(true);
    input.resume();
    input.on("data", onData);
  });
}
