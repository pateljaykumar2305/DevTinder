const express = require('express');
require('./config/database.js');
const User = require('./models/userSchema.js');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "https://fedevtinder.vercel.app" ,
  credentials: true
}));

const authRouter = require('./routes/auth.js');
const profileRouter = require('./routes/profile.js');
const requestRouter = require('./routes/request.js');
const userRouter = require('./routes/user.js');



app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);

app.use((err, req, res, next) => {
    console.error('Error:', err.message); // Log the error for debugging

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Show stack trace only in development
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});