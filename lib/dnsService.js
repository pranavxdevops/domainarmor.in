import dns from 'dns';
import { promisify } from 'util';

const resolveTxt = promisify(dns.resolveTxt);
const resolveMx = promisify(dns.resolveMx);
const resolve4 = promisify(dns.resolve4);

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
            .map((r) => `${r.exchange} (priority: ${r.priority})`);
    } catch {
        return [];
    }
}

/**
 * Resolve domain to IPv4 addresses
 */
export async function resolveIPv4(domain) {
    try {
        return await resolve4(domain);
    } catch {
        return [];
    }
}

/**
 * Run all DNS checks for a domain
 */
export async function runDNSChecks(domain) {
    const [spf, dmarc, dkim, mx] = await Promise.all([
        checkSPF(domain),
        checkDMARC(domain),
        checkDKIM(domain),
        getMXRecords(domain),
    ]);

    return { spf, dmarc, dkim, mx };
}
