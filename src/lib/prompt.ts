import readline from "node:readline";
import { createInterface } from "node:readline/promises";

export interface MultiSelectOption {
  label: string;
  hint?: string;
}

export interface MultiSelectConfig {
  prompt: string;
  initialSelection?: number[];
}

export async function promptMultiSelect(
  options: MultiSelectOption[],
  config: MultiSelectConfig,
): Promise<number[] | undefined> {
  if (!process.stdin.isTTY || !process.stdout.isTTY || options.length === 0) {
    return undefined;
  }

  const input = process.stdin;
  const output = process.stdout;
  const wasRaw = input.isRaw;
  const selected = new Set<number>(config.initialSelection ?? []);
  let cursor = 0;
  let lastRenderHeight = 0;

  readline.emitKeypressEvents(input);

  return await new Promise<number[] | undefined>((resolve, reject) => {
    const render = (): void => {
      if (lastRenderHeight > 0) {
        readline.moveCursor(output, 0, -lastRenderHeight);
        readline.cursorTo(output, 0);
        readline.clearScreenDown(output);
      }

      const lines: string[] = [];
      lines.push(`? ${config.prompt}`);
      lines.push("  ↑/↓ move · space toggle · a toggle all · enter confirm · ctrl-c cancel");

      options.forEach((option, index) => {
        const pointer = index === cursor ? "❯" : " ";
        const box = selected.has(index) ? "◉" : "○";
        const hint = option.hint ? `  ${option.hint}` : "";
        lines.push(` ${pointer} ${box} ${option.label}${hint}`);
      });

      const text = `${lines.join("\n")}\n`;
      output.write(text);
      lastRenderHeight = lines.length;
    };

    const cleanup = (): void => {
      input.off("keypress", onKeypress);
      input.setRawMode?.(Boolean(wasRaw));
      input.pause();
    };

    const finish = (result: number[] | undefined, error?: Error): void => {
      cleanup();
      output.write("\n");
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    };

    const onKeypress = (_str: string, key: readline.Key): void => {
      if (!key) return;

      if (key.ctrl && key.name === "c") {
        finish(undefined, new Error("Selection cancelled."));
        return;
      }

      if (key.name === "up" || key.name === "k") {
        cursor = (cursor - 1 + options.length) % options.length;
        render();
        return;
      }

      if (key.name === "down" || key.name === "j") {
        cursor = (cursor + 1) % options.length;
        render();
        return;
      }

      if (key.name === "space") {
        if (selected.has(cursor)) {
          selected.delete(cursor);
        } else {
          selected.add(cursor);
        }
        render();
        return;
      }

      if (key.name === "a") {
        if (selected.size === options.length) {
          selected.clear();
        } else {
          for (let i = 0; i < options.length; i += 1) selected.add(i);
        }
        render();
        return;
      }

      if (key.name === "return") {
        finish([...selected].sort((a, b) => a - b));
        return;
      }
    };

    input.setEncoding("utf8");
    input.setRawMode?.(true);
    input.resume();
    input.on("keypress", onKeypress);
    render();
  });
}


export async function promptLine(prompt: string): Promise<string | undefined> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return undefined;
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  try {
    return await rl.question(prompt);
  } finally {
    rl.close();
  }
}

export async function promptConfirm(
  prompt: string,
  defaultValue = false,
): Promise<boolean> {
  const hint = defaultValue ? "Y/n" : "y/N";
  const answer = await promptLine(`${prompt} [${hint}] `);

  if (answer === undefined) {
    return defaultValue;
  }

  const normalized = answer.trim().toLowerCase();

  if (normalized === "") {
    return defaultValue;
  }

  return normalized === "y" || normalized === "yes";
}

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
