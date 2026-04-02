import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {Config, DefaultConfig} from "./Config";

export type {Config} from "./Config";
export {DefaultIPv4URLs, DefaultIPv6URLs, DefaultConfig} from "./Config";

const ConfigDir = path.join(os.homedir(), ".ddns-cloudflare");
const ConfigPath = path.join(ConfigDir, "config.json");

function loadConfig(): Config {
  if (!fs.existsSync(ConfigPath)) return DefaultConfig;
  const stored = fs.readFileSync(ConfigPath, "utf-8");
  return JSON.parse(stored);
}

function saveConfig(config: Config): void {
  fs.mkdirSync(ConfigDir, {recursive: true});
  fs.writeFileSync(ConfigPath, JSON.stringify(config, null, 2));
}

export {loadConfig, saveConfig};
