import { executeAddress, type AddressRuntime } from "./address.js";
import { openUrl } from "./browser.js";

export const MIRAGE_FUND_BASE_URL = "https://one.magicblock.app/";

export interface FundOptions {
  wallet?: string;
}

export interface FundRuntime {
  addressRuntime?: AddressRuntime;
  openUrl: (url: string) => Promise<void>;
}

const defaultRuntime: FundRuntime = {
  openUrl,
};

export async function executeFund(
  options: FundOptions = {},
  runtime: FundRuntime = defaultRuntime,
): Promise<string> {
  const address = await executeAddress(options, runtime.addressRuntime);
  const url = new URL(MIRAGE_FUND_BASE_URL);

  url.searchParams.set("rcv", address);

  await runtime.openUrl(url.toString());

  return url.toString();
}
