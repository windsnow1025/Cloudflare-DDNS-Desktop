import Cloudflare from 'cloudflare';

export class DdnsLogic {
    private ipv4QueryUrl: string;
    private ipv6QueryUrl: string;
    private cloudflare: Cloudflare;
    private dnsRecordName: string;
    private zoneId: string;

    constructor(
        ipv4QueryUrl: string,
        ipv6QueryUrl: string,
        cloudflareEmail: string,
        cloudflareApiKey: string,
        dnsRecordName: string
    ) {
        this.cloudflare = new Cloudflare({
            apiEmail: cloudflareEmail,
            apiKey: cloudflareApiKey,
        });
        this.ipv4QueryUrl = ipv4QueryUrl;
        this.ipv6QueryUrl = ipv6QueryUrl;
        this.dnsRecordName = dnsRecordName;
        this.zoneId = '';
    }

    async processUpdate() {
        if (this.zoneId === '') {
            await this.getZoneId();
        }

        const dnsRecord = await this.getDnsRecord();
        if (dnsRecord === null) {
            console.error("DNS Record not found");
            throw new Error("DNS Record not found");
        }

        const ip = await this.fetchCurrentIp(dnsRecord.type);
        if (ip === null) {
            console.error("IP address not found");
            throw new Error("IP address not found");
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
        const zoneName = this.dnsRecordName.split('.').slice(-2).join('.');
        const zone = zones.find(
            (zone) => zone.name === zoneName
        );
        this.zoneId = zone!.id;
    }

    async getDnsRecord() {
        const response = await this.cloudflare.dns.records.list({
            zone_id: this.zoneId
        })
        const dnsRecords = response.result;
        const dnsRecord = dnsRecords.find(
            (dnsRecord) => dnsRecord.name === this.dnsRecordName
        );
        return dnsRecord ? dnsRecord : null;
    }

    async updateDnsRecord(dnsRecord: Cloudflare.DNS.Records.DNSRecord, ip: string) {
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
