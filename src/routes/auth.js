const express = require('express');
const validateSignup = require('../utils/validation');
const authRouter = express.Router();
const bcrypt = require('bcrypt');
const User  = require('../models/userSchema');
const jwt = require('jsonwebtoken');


authRouter.post('/auth/signup', async (req, res, next) => {
    const { firstName, lastName, email, password, phone, photoURL, about, skills, age, gender } = req.body;
    console.log('Request body:', req.body);

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hashedPassword);

        const validationErrors = validateSignup({ firstName, lastName, email, password, phone, photoURL, about, skills, age, gender });
        if (validationErrors.length > 0) {
            return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
        }


        const user = new User({ firstName, lastName, email, password: hashedPassword, phone, photoURL, about, skills, age, gender });
        const savedUser = await user.save();
        console.log('Saved user:', savedUser);

        res.status(201).json({ message: 'User created successfully', user: savedUser });
    } catch (error) {
        next(error);
    }
});

authRouter.post('/auth/createBulkUsers', async (req, res) => {
    const { users } = req.body;
    console.log('Request body:', req.body);

    try {
        const hashedUsers = await Promise.all(users.map(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            return { ...user, password: hashedPassword };
        }));

        const savedUsers = await User.insertMany(hashedUsers);
        console.log('Saved users:', savedUsers);

        res.status(201).json({ message: 'Users created successfully', users: savedUsers });
    } catch (error) {
        console.error('Error creating bulk users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// It's recommended to store secrets in environment variables for security.
// If JWT_SECRET is not set, log a warning and use a default (not for production).
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.warn('Warning: JWT_SECRET is not set in environment variables. Using default secret. DO NOT use this in production!');
}
const JWT_EXPIRES_IN = '15m'; // short expiry for demonstration
const JWT_REFRESH_EXPIRES_IN = '7d'; // refresh token expiry

// Helper to generate tokens
function generateTokens(user) {
    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
    return { token, refreshToken };
}

authRouter.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Request body:', req.body);

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Stored hashed password:', user.password);

        const isPasswordValid = await user.validatePassword(password);

        if (isPasswordValid) {
            const { token, refreshToken } = generateTokens(user);
            res.cookie("token", token, { httpOnly: true });
            res.cookie("refreshToken", refreshToken, { httpOnly: true });

            return res.status(200).json({ message: 'Login successful', user, token, refreshToken });
        } else {
            return res.status(401).json({ message: 'Invalid password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint to refresh token
authRouter.post('/auth/refresh-token', async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token required' });
    }
    try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { token: newToken, refreshToken: newRefreshToken } = generateTokens(user);
        res.cookie("token", newToken, { httpOnly: true });
        res.cookie("refreshToken", newRefreshToken, { httpOnly: true });
        return res.status(200).json({ token: newToken, refreshToken: newRefreshToken });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
});

authRouter.post('/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
});

authRouter.post('/auth/forgotPassword', async (req, res) => {
    const { email } = req.body;
    console.log('Request body:', req.body);

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Here you would typically send a password reset email with a token
        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Error during password reset:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
);  


module.exports = authRouter;