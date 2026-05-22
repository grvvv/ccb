const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    phone: {
        type: String,
        required: true,
        trim: true
    },

    address: {
        type: String,
        required: true,
        trim: true
    },

    locality: {
        type: String,
        required: true,
        trim: true
    },

    type: {
        type: String,
        enum: ["WORK", "HOME"],
        default: "WORK"
    },

    city: {
        type: String,
        required: true,
        trim: true
    },

    state: {
        type: String,
        required: true,
        trim: true
    },

    pincode: {
        type: String,
        required: true,
        trim: true
    }

}, { _id: true });

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    addresses: [addressSchema],

    role: {
        type: String,
        enum: ['admin', 'general'],
        default: 'general'
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);