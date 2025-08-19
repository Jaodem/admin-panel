import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantify: {
            type: Number,
            required: true
        }
    }],
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pendiente', 'enviado', 'entregado'],
        default: 'pendiente'
    }
}, {
    timestamps: true
});

export default mongoose.model('Order', orderSchema);