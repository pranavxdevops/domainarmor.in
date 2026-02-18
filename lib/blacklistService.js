import dns from 'dns';
import { promisify } from 'util';
import { resolveIPv4 } from './dnsService.js';

const resolve4 = promisify(dns.resolve4);

const RBL_SERVERS = [
    'zen.spamhaus.org',
    'bl.spamcop.net',
    'b.barracudacentral.org',
];

/**
 * Reverse an IP address for RBL query
 * e.g., 1.2.3.4 → 4.3.2.1
 */
function reverseIP(ip) {
    return ip.split('.').reverse().join('.');
}

/**
 * Check a single IP against a single RBL server
 */
async function checkRBL(ip, rblServer) {
    const reversed = reverseIP(ip);
    const query = `${reversed}.${rblServer}`;

    try {
        await resolve4(query);
        // If it resolves, the IP is blacklisted
        return true;
    } catch {
        // NXDOMAIN or error means not listed
        return false;
    }
}

/**
 * Check if a domain is blacklisted on any RBL
 */
export async function checkBlacklist(domain) {
    try {
        const ips = await resolveIPv4(domain);

        if (ips.length === 0) {
            return { blacklisted: false, details: [] };
        }

        const results = [];

        for (const ip of ips) {
            const checks = await Promise.all(
                RBL_SERVERS.map(async (server) => {
                    const listed = await checkRBL(ip, server);
                    return { ip, server, listed };
                })
            );
            results.push(...checks);
        }

        const blacklisted = results.some((r) => r.listed);
        const details = results.filter((r) => r.listed);

        return { blacklisted, details };
    } catch {
        return { blacklisted: false, details: [] };
    }
}
