const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 50
        },

        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true
        },

        password: {
            type: String,
            select: false,
            required: [true, 'Password is required'],
            minlength: 8
        }
    },
    {
        timestamps: true,
        strict: 'throw'
    }
);

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;
