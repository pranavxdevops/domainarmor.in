import dns from 'dns';
import { promisify } from 'util';

const resolveTxt = promisify(dns.resolveTxt);
const resolveMx = promisify(dns.resolveMx);
const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);
const resolveCname = promisify(dns.resolveCname);
const resolveNs = promisify(dns.resolveNs);
const resolveSoa = promisify(dns.resolveSoa);

/**
 * Check if domain has SPF record
 */
export async function checkSPF(domain) {
    try {
        const records = await resolveTxt(domain);
        const flat = records.map((r) => r.join('')).filter((r) => r.startsWith('v=spf1'));
        return flat.length > 0;
    } catch {
        return false;
    }
}

/**
 * Check if domain has DMARC record
 */
export async function checkDMARC(domain) {
    try {
        const records = await resolveTxt(`_dmarc.${domain}`);
        const flat = records.map((r) => r.join('')).filter((r) => r.startsWith('v=DMARC1'));
        return flat.length > 0;
    } catch {
        return false;
    }
}

/**
 * Check if domain has DKIM record (using selector1)
 */
export async function checkDKIM(domain) {
    try {
        const records = await resolveTxt(`selector1._domainkey.${domain}`);
        return records.length > 0;
    } catch {
        return false;
    }
}

/**
 * Get MX records for domain
 */
export async function getMXRecords(domain) {
    try {
        const records = await resolveMx(domain);
        return records
            .sort((a, b) => a.priority - b.priority)
            .map((r) => ({ exchange: r.exchange, priority: r.priority }));
    } catch {
        return [];
    }
}

/**
 * Get all TXT records for domain
 */
export async function getTXTRecords(domain) {
    try {
        const records = await resolveTxt(domain);
        return records.map((r) => r.join(''));
    } catch {
        return [];
    }
}

/**
 * Resolve domain to IPv4 addresses (A records)
 */
export async function resolveIPv4(domain) {
    try {
        return await resolve4(domain);
    } catch {
        return [];
    }
}

/**
 * Resolve domain to IPv6 addresses (AAAA records)
 */
export async function resolveIPv6(domain) {
    try {
        return await resolve6(domain);
    } catch {
        return [];
    }
}

/**
 * Get CNAME records for domain
 */
export async function getCNAME(domain) {
    try {
        return await resolveCname(domain);
    } catch {
        return [];
    }
}

/**
 * Get NS (nameserver) records for domain
 */
export async function getNSRecords(domain) {
    try {
        return await resolveNs(domain);
    } catch {
        return [];
    }
}

/**
 * Get SOA (Start of Authority) record for domain
 */
export async function getSOARecord(domain) {
    try {
        return await resolveSoa(domain);
    } catch {
        return null;
    }
}

/**
 * Run all DNS checks for a domain
 */
export async function runDNSChecks(domain) {
    const [spf, dmarc, dkim, mx, txt, aRecords, aaaaRecords, cname, ns, soa] = await Promise.all([
        checkSPF(domain),
        checkDMARC(domain),
        checkDKIM(domain),
        getMXRecords(domain),
        getTXTRecords(domain),
        resolveIPv4(domain),
        resolveIPv6(domain),
        getCNAME(domain),
        getNSRecords(domain),
        getSOARecord(domain),
    ]);

    return { spf, dmarc, dkim, mx, txt, aRecords, aaaaRecords, cname, ns, soa };
}
