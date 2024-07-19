const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: "https://res.cloudinary.com/dihbz54le/image/upload/v1721291355/book-img_ufblpd.png"
        // required: true
    },
    password: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    code: {
        type: String,
        // required: false
    },
    active: {
        type: Boolean,
        required: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    mobile: {
        type: Number,
        required: true
    },


}, { timestamps: true })

module.exports = mongoose.model("user", userSchema)