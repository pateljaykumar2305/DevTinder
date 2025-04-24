const express = require('express');
require('./config/database.js');
const User = require('./models/userSchema.js');

const app = express();

app.use(express.json());

app.post('/signup', async (req, res) => {

    const { firstName, lastName, phone } = req.body;
    console.log('Request body:', req.body);
    if (!firstName || !lastName || !phone) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const user = new User({
        firstName,
        lastName,
        phone
    });

    const savedUser = await user.save();
        console.log('Saved user:', savedUser);

    res.status(201).json({ message: 'User created successfully', user: savedUser });
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});