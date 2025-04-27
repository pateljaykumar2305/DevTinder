const express = require('express');
require('./config/database.js');
const User = require('./models/userSchema.js');

const app = express();

app.use(express.json());

app.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password, phone, photoURL, about, skills, age, gender } = req.body;
    console.log('Request body:', req.body);

    if (!firstName || !lastName || !email || !password || !phone) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const user = new User({
            firstName,
            lastName,
            email,
            password,
            phone,
            photoURL,
            about,
            skills,
            age,
            gender
        });

        const savedUser = await user.save();
        console.log('Saved user:', savedUser);

        res.status(201).json({ message: 'User created successfully', user: savedUser });
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json(error.message);
    }
});

app.post('/login' , async (req , res) => {
    const {email , password} = req.body;
    console.log('Request body:', req.body);

    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ email : email , password : password});
    res.send(user);
})

app.get('/allUsers' , async (req, res) => {
    const users = await User.find();
    console.log('All users:', users);
    res.send(users);    
})

app.patch('/updateUser', async (req, res) => {
    const { id, firstName, lastName, email, password, phone, photoURL, about, skills, age, gender } = req.body;
    console.log('Request body:', req.body);
    if (!id) {
        return res.status(400).json({ message: 'ID is required' });
    }

    try {
        const user = await User.findByIdAndUpdate(
            id,
            {
                firstName,
                lastName,
                email,
                password,
                phone,
                photoURL,
                about,
                skills,
                age,
                gender
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});