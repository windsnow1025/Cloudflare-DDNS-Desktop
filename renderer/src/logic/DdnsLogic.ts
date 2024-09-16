import Cloudflare from 'cloudflare';

export class DdnsLogic {
    private ipv4QueryUrl: string;
    private ipv6QueryUrl: string;
    private cloudflare: Cloudflare;
    private dnsRecordNames: string[];
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
                yield `DNS Record for ${dnsRecordName} updated: ${result}`;
            } else {
                yield `DNS Record for ${dnsRecordName} is up to date`;
            }
        }
    }

    async processUpdate(dnsRecordName: string) {
        const dnsRecord = await this.getDnsRecord(dnsRecordName);
        if (dnsRecord === null) {
            console.error(`DNS Record for ${dnsRecordName} not found`);
            throw new Error(`DNS Record for ${dnsRecordName} not found`);
        }

        let ip: string;
        try {
            ip = await this.fetchCurrentIp(dnsRecord.type);
        } catch {
            console.error("Failed to fetch current IP");
            throw new Error("Failed to fetch current IP");
        }

        if (ip !== dnsRecord.content) {
            await this.updateDnsRecord(dnsRecord, ip);
            console.log(`DNS Record updated: ${dnsRecord.content}`);
            return dnsRecord.content;
        } else {
            console.log("DNS Record is up to date");
            return false;
        }
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

    async getDnsRecord(dnsRecordName: string) {
        const response = await this.cloudflare.dns.records.list({
            zone_id: this.zoneId
        })
        const dnsRecords = response.result;
        const dnsRecord = dnsRecords.find(
            (dnsRecord) => dnsRecord.name === dnsRecordName
        );
        return dnsRecord ? dnsRecord : null;
    }

    async updateDnsRecord(dnsRecord: Cloudflare.DNS.Records.Record, ip: string) {
        const response = await this.cloudflare.dns.records.update(
            dnsRecord.id!,
            {
                zone_id: this.zoneId,
                content: ip,
                name: dnsRecord.name,
                type: dnsRecord.type as 'A' | 'AAAA',
            }
        )
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
