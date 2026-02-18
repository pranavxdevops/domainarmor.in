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

    await connectDB();

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
        return errorResponse(res, 401, 'Invalid email or password');
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        return errorResponse(res, 401, 'Invalid email or password');
    }

    // Generate token
    const token = generateToken(user._id, user.email);

    return successResponse(res, {
        token,
        user: {
            id: user._id,
            email: user.email,
            plan: user.plan,
        },
    });
}

export default withErrorHandler(handler);
