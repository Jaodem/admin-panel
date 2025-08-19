import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        requied: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String
    },
    address: {
        type: String
    }
}, {
    timestamps: true
});

export default mongoose.model('Client', clientSchema);