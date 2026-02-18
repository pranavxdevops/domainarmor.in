import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// ─── Rate Limiter (in-memory, per-IP) ───────────────────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // max requests per window

/**
 * Simple in-memory rate limiter
 */
export function rateLimit(req) {
    const ip =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.socket?.remoteAddress ||
        'unknown';

    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW;

    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, []);
    }

    const timestamps = rateLimitMap.get(ip).filter((t) => t > windowStart);
    timestamps.push(now);
    rateLimitMap.set(ip, timestamps);

    if (timestamps.length > RATE_LIMIT_MAX) {
        return false; // rate limited
    }

    return true; // allowed
}

// ─── JWT Auth Middleware ─────────────────────────────────────────────

/**
 * Verify JWT token from Authorization header
 * Returns decoded payload or null
 */
export function verifyAuth(req) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch {
        return null;
    }
}

/**
 * Generate JWT token for a user
 */
export function generateToken(userId, email) {
    return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
}

// ─── Input Validation ───────────────────────────────────────────────

/**
 * Validate email format
 */
export function isValidEmail(email) {
    const regex = /^\S+@\S+\.\S+$/;
    return regex.test(email);
}

/**
 * Validate domain format
 */
export function isValidDomain(domain) {
    const regex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return regex.test(domain);
}

// ─── Error Response Helpers ─────────────────────────────────────────

export function errorResponse(res, statusCode, message) {
    const isProduction = process.env.NODE_ENV === 'production';
    return res.status(statusCode).json({
        success: false,
        error: isProduction && statusCode >= 500 ? 'Internal server error' : message,
    });
}

export function successResponse(res, data, statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        data,
    });
}

/**
 * Wrapper to handle async route errors
 */
export function withErrorHandler(handler) {
    return async (req, res) => {
        try {
            // Rate limiting
            if (!rateLimit(req)) {
                return errorResponse(res, 429, 'Too many requests. Please try again later.');
            }

            await handler(req, res);
        } catch (error) {
            console.error('[API Error]', error);
            return errorResponse(res, 500, error.message);
        }
    };
}
