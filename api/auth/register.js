import connectDB from '../../lib/db.js';
import User from '../../models/User.js';
import {
    withErrorHandler,
    generateToken,
    isValidEmail,
    errorResponse,
    successResponse,
} from '../../lib/authMiddleware.js';

async function handler(req, res) {
    if (req.method !== 'POST') {
        return errorResponse(res, 405, 'Method not allowed');
    }

    const { email, password } = req.body || {};

    // Validate input
    if (!email || !password) {
        return errorResponse(res, 400, 'Email and password are required');
    }

    if (!isValidEmail(email)) {
        return errorResponse(res, 400, 'Please enter a valid email address');
    }

    if (password.length < 6) {
        return errorResponse(res, 400, 'Password must be at least 6 characters');
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        return errorResponse(res, 409, 'An account with this email already exists');
    }

    // Create user
    const user = await User.create({
        email: email.toLowerCase(),
        password,
    });

    // Generate token
    const token = generateToken(user._id, user.email);

    return successResponse(res, {
        token,
        user: {
            id: user._id,
            email: user.email,
            plan: user.plan,
        },
    }, 201);
}

export default withErrorHandler(handler);
