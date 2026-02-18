import connectDB from '../../lib/db.js';
import Domain from '../../models/Domain.js';
import ScanLog from '../../models/ScanLog.js';
import {
    withErrorHandler,
    verifyAuth,
    errorResponse,
    successResponse,
} from '../../lib/authMiddleware.js';

async function handler(req, res) {
    if (req.method !== 'GET') {
        return errorResponse(res, 405, 'Method not allowed');
    }

    // Auth check
    const auth = verifyAuth(req);
    if (!auth) {
        return errorResponse(res, 401, 'Authentication required');
    }

    await connectDB();

    // Get all domains for the user
    const domains = await Domain.find({ userId: auth.userId })
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
