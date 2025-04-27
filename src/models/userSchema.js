const mongoose = require('mongoose');

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
        lowercase: true,
        required: true,
        unique: true,
        trim: true, 
    },
    password: {
        type: String,
        required: true,
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
        default: 'https://avatar.iran.liara.run/public/31', // Default profile picture URL
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

const User = mongoose.model('User', userSchema);
module.exports = User;
