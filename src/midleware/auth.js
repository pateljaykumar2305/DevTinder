const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');

// Use environment variable for JWT secret, warn if not set
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
if (!process.env.JWT_SECRET) {
    console.warn('Warning: JWT_SECRET is not set in environment variables. Using default secret. DO NOT use this in production!');
}

const userAuth = async (req, res, next) => {
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    console.log('Token from cookies:', req.cookies);
    console.log('Token from request:', token);

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = await jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.id || decoded._id);
        if (!user) {
            throw new Error('User not found');
        }
        req.user = user;
        next();
    } catch (error) {
        console.error('Error in userAuth middleware:', error.message);
        return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
    }
};

module.exports = { userAuth };