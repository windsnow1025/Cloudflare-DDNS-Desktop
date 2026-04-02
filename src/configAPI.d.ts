import {Config} from './lib/Config';

interface ConfigAPI {
  loadConfig(): Promise<Config>;
  saveConfig(config: Config): Promise<void>;
}

declare global {
  interface Window {
    configAPI: ConfigAPI;
  }
}
