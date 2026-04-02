const StorageKey = "config";

const DefaultIPv4URLs = [
  "https://ipv4.icanhazip.com/",
  "https://ip.3322.net/",
];

const DefaultIPv6URLs = [
  "https://ipv6.icanhazip.com/",
  "https://speed.neu6.edu.cn/getIP.php",
];

interface Config {
  ipv4QueryUrl: string;
  ipv6QueryUrl: string;
  ipv4CustomOptions: string[];
  ipv6CustomOptions: string[];
  cloudflareEmail: string;
  cloudflareApiKey: string;
  dnsRecordNames: string[];
  autoStart: boolean;
}

const DefaultConfig: Config = {
  ipv4QueryUrl: DefaultIPv4URLs[0],
  ipv6QueryUrl: DefaultIPv6URLs[0],
  ipv4CustomOptions: [],
  ipv6CustomOptions: [],
  cloudflareEmail: "",
  cloudflareApiKey: "",
  dnsRecordNames: [],
  autoStart: false,
};

function loadConfig(): Config {
  const stored = localStorage.getItem(StorageKey);
  if (!stored) return DefaultConfig;
  return {...DefaultConfig, ...JSON.parse(stored)};
}

function saveConfig(config: Config): void {
  localStorage.setItem(StorageKey, JSON.stringify(config));
}

export type {Config};
export {DefaultIPv4URLs, DefaultIPv6URLs, DefaultConfig, loadConfig, saveConfig};
