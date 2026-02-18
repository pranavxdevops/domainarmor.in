import connectDB from '../../lib/db.js';
import Domain from '../../models/Domain.js';
import ScanLog from '../../models/ScanLog.js';
import { runDNSChecks } from '../../lib/dnsService.js';
import { checkBlacklist } from '../../lib/blacklistService.js';
import { calculateScore } from '../../lib/scoringService.js';
import {
    withErrorHandler,
    verifyAuth,
    errorResponse,
    successResponse,
} from '../../lib/authMiddleware.js';

/**
 * Attempt to get domain expiry date via WHOIS
 * Falls back gracefully if not available
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

/**
 * Run a full scan on a domain
 */
export async function runFullScan(domainName) {
    // Run all checks in parallel
    const [dnsResults, blacklistResult, expiryDate] = await Promise.all([
        runDNSChecks(domainName),
        checkBlacklist(domainName),
        getExpiryDate(domainName),
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

    return {
        ...scanData,
        score,
        status,
        blacklistDetails: blacklistResult.details,
    };
}

async function handler(req, res) {
    if (req.method !== 'POST') {
        return errorResponse(res, 405, 'Method not allowed');
    }

    // Auth check
    const auth = verifyAuth(req);
    if (!auth) {
        return errorResponse(res, 401, 'Authentication required');
    }

    const { domainId } = req.body || {};

    if (!domainId) {
        return errorResponse(res, 400, 'Domain ID is required');
    }

    await connectDB();

    // Find domain and verify ownership
    const domain = await Domain.findOne({ _id: domainId, userId: auth.userId });
    if (!domain) {
        return errorResponse(res, 404, 'Domain not found');
    }

    // Run full scan
    const scanResult = await runFullScan(domain.domain);

    // Save scan log
    const scanLog = await ScanLog.create({
        domainId: domain._id,
        spf: scanResult.spf,
        dmarc: scanResult.dmarc,
        dkim: scanResult.dkim,
        mx: scanResult.mx,
        expiryDate: scanResult.expiryDate,
        blacklisted: scanResult.blacklisted,
        score: scanResult.score,
    });

    // Update domain with latest score and status
    domain.lastScore = scanResult.score;
    domain.lastStatus = scanResult.status;
    await domain.save();

    return successResponse(res, {
        scan: scanLog,
        score: scanResult.score,
        status: scanResult.status,
    });
}

export default withErrorHandler(handler);
