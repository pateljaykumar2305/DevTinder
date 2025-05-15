const express = require('express');
const User = require('../models/userSchema');
const { userAuth } = require('../midleware/auth');

const profileRouter = express.Router();

profileRouter.get('/profile/view', userAuth, async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Profile fetched successfully', user });
    } catch (error) {
        console.error('Error in /profile:', error.message);
        res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
    }
});

profileRouter.get('/profile/edit', userAuth, async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { photoURL, about, skills, age, phone, gender, firstName, lastName } = req.body;

        if (photoURL) user.photoURL = photoURL;
        if (about) user.about = about;
        if (skills) user.skills = skills;
        if (age) user.age = age;
        if (phone) user.phone = phone;
        if (gender) user.gender = gender;
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;

        await user.save();

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Error in /profile/edit:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




profileRouter.get('/profile/allUsers' , async (req, res) => {
    const users = await User.find();
    console.log('All users:', users);
    return res.send(users);    
})

// Update the User
profileRouter.patch('/profile/updateUser', async (req, res) => {
    const { _id, ...data } = req.body;
    console.log('Request Id:', _id);
    console.log('Request body:', req.body);
    if (!_id) {
        return res.status(400).json({ message: 'ID is required' });
    }

    isAllowed = [ "_id" , "photoURL" , "about", "skills", "age"];

    const isUpdateAllowed = Object.keys(data).every((key) => {
        return isAllowed.includes(key);
    }
    );

    if (!isUpdateAllowed) {
        throw new error ({ message: 'Update is not allowed' });
    }

    try {
        const user = await User.findByIdAndUpdate(
            _id, data, 
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

profileRouter.delete('/profile/deleteUser', async (req, res) => { 
    const { _id } = req.body;
    console.log('Request Id:', _id);
    console.log('Request body:', req.body);

    if (!_id) {
        return res.status(400).json({ message: 'ID is required' });
    }

    try {
        const user = await User.findByIdAndDelete(_id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
);



module.exports = profileRouter;