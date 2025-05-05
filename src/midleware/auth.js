const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');

const userAuth =  async (req, res, next) => {
   
    const token = req.cookies.token;
    console.log('Token from cookies:', req.cookies);

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try{

        const decoded = await jwt.verify(token, "DefaultSecretKey");

        const user = await User.findById(decoded._id);
        if (!user) {
            throw new Error('User not found');
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Error in userAuth middleware:', error.message);
        return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
    }

};

module.exports = { userAuth};