import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Email inválido']
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    verified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;