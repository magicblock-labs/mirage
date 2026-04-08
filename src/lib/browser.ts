import { spawn } from "node:child_process";

export async function openUrl(url: string): Promise<void> {
  const [command, args] = getOpenCommand(url);

  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "ignore",
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`Browser launcher terminated with signal ${signal}.`));
        return;
      }

      if (code && code !== 0) {
        reject(new Error(`Browser launcher exited with code ${code}.`));
        return;
      }

      resolve();
    });
  });
}

function getOpenCommand(url: string): [string, string[]] {
  if (process.platform === "darwin") {
    return ["open", [url]];
  }

  if (process.platform === "win32") {
    return ["cmd", ["/c", "start", "", url]];
  }

  return ["xdg-open", [url]];
}
