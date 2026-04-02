import {Config, DefaultConfig} from "./Config";

export type {Config} from "./Config";
export {DefaultIPv4URLs, DefaultIPv6URLs, DefaultConfig} from "./Config";

const StorageKey = "config";

function loadConfig(): Config {
  const stored = localStorage.getItem(StorageKey);
  if (!stored) return DefaultConfig;
  return {...DefaultConfig, ...JSON.parse(stored)};
}

function saveConfig(config: Config): void {
  localStorage.setItem(StorageKey, JSON.stringify(config));
}

export {loadConfig, saveConfig};
