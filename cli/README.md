# Cloudflare DDNS CLI

A CLI tool for automatic DDNS management on Cloudflare.

## Usage

```bash
npx cloudflare-ddns-cli
```

or

```bash
npm install -g cloudflare-ddns-cli
cloudflare-ddns
```

If no config exists at `~/.cloudflare-ddns/config.json`, the CLI will prompt for setup (Cloudflare credentials, DNS records, IP service URLs). Then it starts polling and updating DNS records every 10 seconds.
