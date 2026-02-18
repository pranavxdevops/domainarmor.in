import connectDB from '../../lib/db.js';
import Domain from '../../models/Domain.js';
import {
    withErrorHandler,
    isValidDomain,
    errorResponse,
    successResponse,
} from '../../lib/authMiddleware.js';

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

    await connectDB();

    // Check if domain already exists
    const existing = await Domain.findOne({ domain: cleanDomain });
    if (existing) {
        return errorResponse(res, 409, 'This domain is already in your list');
    }

    // Create domain
    const newDomain = await Domain.create({
        domain: cleanDomain,
    });

    return successResponse(res, { domain: newDomain }, 201);
}

export default withErrorHandler(handler);
