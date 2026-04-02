import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {Config, DefaultConfig} from "../../src/lib/Config";

export type {Config} from "../../src/lib/Config";
export {DefaultIPv4URLs, DefaultIPv6URLs, DefaultConfig} from "../../src/lib/Config";

const ConfigDir = path.join(os.homedir(), ".cloudflare-ddns");
const ConfigPath = path.join(ConfigDir, "config.json");

function loadConfig(): Config {
  if (!fs.existsSync(ConfigPath)) return DefaultConfig;
  const stored = fs.readFileSync(ConfigPath, "utf-8");
  return {...DefaultConfig, ...JSON.parse(stored)};
}

function saveConfig(config: Config): void {
  fs.mkdirSync(ConfigDir, {recursive: true});
  fs.writeFileSync(ConfigPath, JSON.stringify(config, null, 2));
}

export {loadConfig, saveConfig};
