import { runDNSChecks, getMXRecords, resolveIPv4 } from '../lib/dnsService.js';
import { checkBlacklist } from '../lib/blacklistService.js';
import { calculateScore } from '../lib/scoringService.js';
import {
    withErrorHandler,
    isValidDomain,
    errorResponse,
    successResponse,
} from '../lib/authMiddleware.js';

/**
 * Attempt to get domain expiry date via WHOIS
 */
async function getExpiryDate(domain) {
    try {
        const whois = await import('whois-json');
        const result = await whois.default(domain);

        if (result.expirationDate) {
            return new Date(result.expirationDate);
        }
        if (result.registryExpiryDate) {
            return new Date(result.registryExpiryDate);
        }
        if (result.registrarRegistrationExpirationDate) {
            return new Date(result.registrarRegistrationExpirationDate);
        }
        return null;
    } catch {
        return null;
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
    const [dnsResults, blacklistResult, expiryDate, ipAddresses] = await Promise.all([
        runDNSChecks(cleanDomain),
        checkBlacklist(cleanDomain),
        getExpiryDate(cleanDomain),
        resolveIPv4(cleanDomain),
    ]);

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
        spf: dnsResults.spf,
        dmarc: dnsResults.dmarc,
        dkim: dnsResults.dkim,
        mx: dnsResults.mx,
        ipAddresses,
        expiryDate,
        blacklisted: blacklistResult.blacklisted,
        blacklistDetails: blacklistResult.details,
    });
}

export default withErrorHandler(handler);
