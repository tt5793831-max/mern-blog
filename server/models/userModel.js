const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    name: { 
        type: String, 
        required: true,
        trim: true 
    },
    email: { 
        type: String, 
        required: true,
        unique: true, // အီးမေးလ် ထပ်မနေစေရန်
        trim: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    avatar: {
        type: String
    },
    posts: {
        type: Number, 
        default: 0
    }
});

module.exports = model('User', userSchema);