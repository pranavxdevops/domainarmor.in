import { runDNSChecks } from '../lib/dnsService.js';
import { checkBlacklist } from '../lib/blacklistService.js';
import { checkSSL } from '../lib/sslService.js';
import { calculateScore } from '../lib/scoringService.js';
import {
    withErrorHandler,
    isValidDomain,
    errorResponse,
    successResponse,
} from '../lib/authMiddleware.js';

/**
 * Get WHOIS info: expiry date + registrar details
 * Data fetched via WHOIS protocol (same source as whois.com)
 * whoisUrl links to whois.com for full raw record
 */
async function getWhoisInfo(domain) {
    try {
        const whois = await import('whois-json');
        const result = await whois.default(domain);

        // Pick first valid value from possible WHOIS field names
        const pick = (...keys) => {
            for (const k of keys) {
                if (result[k]) return result[k];
            }
            return null;
        };

        const expiryRaw = pick('expirationDate', 'registryExpiryDate', 'registrarRegistrationExpirationDate', 'expiresOn', 'paid-till');
        const expiryDate = expiryRaw ? new Date(expiryRaw) : null;

        const registrar = {
            name: pick('registrar', 'registrarName', 'sponsoringRegistrar'),
            url: pick('registrarUrl', 'referralUrl', 'registrarURL'),
            ianaId: pick('registrarIanaId', 'registrarIANAID'),
            abuseEmail: pick('registrarAbuseContactEmail', 'abuseContactEmail'),
            abusePhone: pick('registrarAbuseContactPhone', 'abuseContactPhone'),
            createdDate: pick('creationDate', 'createdDate', 'created', 'domainRegistrationDate'),
            updatedDate: pick('updatedDate', 'lastUpdated', 'lastModified', 'changed'),
            registrant: pick('registrantOrganization', 'registrantName', 'orgName', 'org-name'),
            registrantCountry: pick('registrantCountry', 'registrantStateProvince'),
            dnssec: pick('dnssec', 'DNSSEC'),
            status: pick('domainStatus', 'status'),
        };

        return {
            expiryDate,
            registrar,
            whoisUrl: `https://www.whois.com/whois/${domain}`,
        };
    } catch {
        return {
            expiryDate: null,
            registrar: null,
            whoisUrl: `https://www.whois.com/whois/${domain}`,
        };
    }
}

async function handler(req, res) {
    if (req.method !== 'POST') {
        return errorResponse(res, 405, 'Method not allowed');
    }

    const { domain } = req.body || {};

    if (!domain) {
        return errorResponse(res, 400, 'Domain is required');
    }

    // Clean and validate domain
    const cleanDomain = domain.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/+$/, '');

    if (!isValidDomain(cleanDomain)) {
        return errorResponse(res, 400, 'Please enter a valid domain (e.g., example.com)');
    }

    // Run all checks in parallel
    const [dnsResults, blacklistResult, whoisInfo, sslResult] = await Promise.all([
        runDNSChecks(cleanDomain),
        checkBlacklist(cleanDomain),
        getWhoisInfo(cleanDomain),
        checkSSL(cleanDomain),
    ]);

    const { expiryDate, registrar, whoisUrl } = whoisInfo;

    const scanData = {
        spf: dnsResults.spf,
        dmarc: dnsResults.dmarc,
        dkim: dnsResults.dkim,
        mx: dnsResults.mx,
        expiryDate,
        blacklisted: blacklistResult.blacklisted,
    };

    // Calculate score
    const { score, status } = calculateScore(scanData);

    return successResponse(res, {
        domain: cleanDomain,
        score,
        status,
        // Security checks
        spf: dnsResults.spf,
        dmarc: dnsResults.dmarc,
        dkim: dnsResults.dkim,
        // DNS records
        mx: dnsResults.mx,
        txt: dnsResults.txt,
        aRecords: dnsResults.aRecords,
        aaaaRecords: dnsResults.aaaaRecords,
        cname: dnsResults.cname,
        ns: dnsResults.ns,
        soa: dnsResults.soa,
        // SSL
        ssl: sslResult,
        // WHOIS
        expiryDate,
        registrar,
        whoisUrl,
        blacklisted: blacklistResult.blacklisted,
        blacklistDetails: blacklistResult.details,
    });
}

export default withErrorHandler(handler);
