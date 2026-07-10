import { r2Provider } from "./r2-provider";
import { driveProvider } from "./drive-provider";
import type { StorageProvider } from "./types";

export function getStorageProvider(provider: string): StorageProvider {
  if (provider === "r2") return r2Provider;
  if (provider === "drive") return driveProvider;
  throw new Error(`Unknown storage provider: ${provider}`);
}

export * from "./types";
