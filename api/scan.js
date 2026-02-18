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
 */
async function getWhoisInfo(domain) {
    try {
        const whois = await import('whois-json');
        const result = await whois.default(domain);

        const expiryDate = result.expirationDate
            ? new Date(result.expirationDate)
            : result.registryExpiryDate
                ? new Date(result.registryExpiryDate)
                : result.registrarRegistrationExpirationDate
                    ? new Date(result.registrarRegistrationExpirationDate)
                    : null;

        const registrar = {
            name: result.registrar || result.registrarName || null,
            url: result.registrarUrl || result.referralUrl || null,
            ianaId: result.registrarIanaId || null,
            createdDate: result.creationDate || result.createdDate || null,
            updatedDate: result.updatedDate || result.lastUpdated || null,
            dnssec: result.dnssec || null,
            status: result.domainStatus || result.status || null,
        };

        return { expiryDate, registrar };
    } catch {
        return { expiryDate: null, registrar: null };
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

    const { expiryDate, registrar } = whoisInfo;

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
        blacklisted: blacklistResult.blacklisted,
        blacklistDetails: blacklistResult.details,
    });
}

export default withErrorHandler(handler);
