import connectDB from '../../lib/db.js';
import ScanLog from '../../models/ScanLog.js';
import Domain from '../../models/Domain.js';
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

    const auth = verifyAuth(req);
    if (!auth) {
        return errorResponse(res, 401, 'Authentication required');
    }

    const { id } = req.query;

    if (!id) {
        return errorResponse(res, 400, 'Domain ID is required');
    }

    await connectDB();

    // Verify domain belongs to user
    const domain = await Domain.findOne({ _id: id, userId: auth.userId }).lean();
    if (!domain) {
        return errorResponse(res, 404, 'Domain not found');
    }

    // Get all scan logs for this domain
    const scanLogs = await ScanLog.find({ domainId: id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

    return successResponse(res, { domain, scanLogs });
}

export default withErrorHandler(handler);
