import Cloudflare from 'cloudflare';

export class DDNSLogic {
    private readonly ipv4QueryUrl: string;
    private readonly ipv6QueryUrl: string;
    private cloudflare: Cloudflare;
    private readonly dnsRecordNames: string[];
    private zoneId: string;

    constructor(
        ipv4QueryUrl: string,
        ipv6QueryUrl: string,
        cloudflareEmail: string,
        cloudflareApiKey: string,
        dnsRecordNames: string[]
    ) {
        this.cloudflare = new Cloudflare({
            apiEmail: cloudflareEmail,
            apiKey: cloudflareApiKey,
        });
        this.ipv4QueryUrl = ipv4QueryUrl;
        this.ipv6QueryUrl = ipv6QueryUrl;
        this.dnsRecordNames = dnsRecordNames;
        this.zoneId = '';
    }

    async *processUpdates() {
        if (this.zoneId === '') {
            await this.getZoneId();
        }
        for (const dnsRecordName of this.dnsRecordNames) {
            const result = await this.processUpdate(dnsRecordName);
            if (result) {
                yield `DNS Records for ${dnsRecordName} updated: ${result}`;
            } else {
                yield `DNS Records for ${dnsRecordName} is up to date`;
            }
        }
    }

    async processUpdate(dnsRecordName: string) {
        const dnsRecords = await this.getDNSRecords(dnsRecordName);

        let updatedRecords: string[] = [];

        for (const dnsRecord of dnsRecords) {
            let ip: string;
            try {
                ip = await this.fetchCurrentIp(dnsRecord.type);
            } catch {
                const ipType = dnsRecord.type === "A" ? "IPv4" : "IPv6";
                console.error(`Failed to fetch current ${ipType}`);
                throw new Error(`Failed to fetch current ${ipType}`);
            }

            if (ip !== dnsRecord.content) {
                await this.updateDNSRecord(dnsRecord, ip);
                console.log(`DNS Records updated: ${dnsRecord.content}`);
                updatedRecords.push(`${dnsRecord.content}`);
            } else {
                console.log(`DNS Records is up to date: ${dnsRecord.name} (${dnsRecord.type})`);
            }
        }

        return updatedRecords.length > 0 ? updatedRecords.join(', ') : null;
    }

    async getZoneId() {
        const response = await this.cloudflare.zones.list();
        const zones = response.result;
        const zoneName = this.dnsRecordNames[0].split('.').slice(-2).join('.');
        const zone = zones.find(
            (zone) => zone.name === zoneName
        );
        this.zoneId = zone!.id;
    }

    async getDNSRecords(dnsRecordName: string) {
        const response = await this.cloudflare.dns.records.list({
            zone_id: this.zoneId
        })
        const dnsRecords = response.result;
        return dnsRecords.filter(
            (dnsRecord) => dnsRecord.name === dnsRecordName
        );
    }

    async updateDNSRecord(dnsRecord: Cloudflare.DNS.Records.Record, ip: string) {
        await this.cloudflare.dns.records.update(
          dnsRecord.id!,
          {
              zone_id: this.zoneId,
              content: ip,
              name: dnsRecord.name,
              type: dnsRecord.type as 'A' | 'AAAA',
          }
        );
    }

    async fetchCurrentIp(type: string) {
        let queryUrl = '';
        if (type === 'A') {
            queryUrl = this.ipv4QueryUrl;
        } else if (type === 'AAAA') {
            queryUrl = this.ipv6QueryUrl;
        }
        const response = await fetch(queryUrl);
        const ip = await response.text();
        return ip.trim();
    }
}
