const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength : 4,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is not valid');
            }
        },
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error(' Password is not strong enough');
            }
        },
    },
    phone: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        min: 12,
    },
    gender:{
        type: String,
        validate(value){
         if(!["male" , "female" ,"other"].includes(value)){
            throw new Error("Gender data is not valid");
        }
    },
    },
    photoURL:{
        type: String,
        default: 'https://avatar.iran.liara.run/public/31', 
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error('Photo URL is not valid');
            }
        },
    },
    about:{
        type: String,
        default: 'Hello, I am using this app',
    },
    skills:{
        type: Array,
        default: [],
    },

} ,
{
    timestamps: true,
});

userSchema.methods.getJwtToken = async function () {
    user = this;
    const token = await jwt.sign({ _id: this._id }, "DefaultSecretKey" , {
        expiresIn: '1h',
    });

    return token;
}

userSchema.methods.validatePassword = async function (passwordByUser) {
    user = this;
    const hashedPassword = user.password;
    const isPasswordValid = await bcrypt.compare(passwordByUser, hashedPassword);
    return isPasswordValid;
}

module.exports = mongoose.model('User', userSchema);
