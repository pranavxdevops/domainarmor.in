import connectDB from '../../lib/db.js';
import Domain from '../../models/Domain.js';
import ScanLog from '../../models/ScanLog.js';
import {
    withErrorHandler,
    errorResponse,
    successResponse,
} from '../../lib/authMiddleware.js';

async function handler(req, res) {
    if (req.method !== 'GET') {
        return errorResponse(res, 405, 'Method not allowed');
    }

    await connectDB();

    // Get all domains
    const domains = await Domain.find()
        .sort({ createdAt: -1 })
        .lean();

    // Fetch latest scan log for each domain
    const domainsWithScans = await Promise.all(
        domains.map(async (domain) => {
            const latestScan = await ScanLog.findOne({ domainId: domain._id })
                .sort({ createdAt: -1 })
                .lean();

            return {
                ...domain,
                latestScan,
            };
        })
    );

    return successResponse(res, { domains: domainsWithScans });
}

export default withErrorHandler(handler);
