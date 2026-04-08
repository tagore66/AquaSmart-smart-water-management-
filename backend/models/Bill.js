const mongoose = require('mongoose');

const billSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    usage: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'WaterUsage'
    },
    amount: {
        type: Number,
        required: true
    },
    slabBreakdown: [{
        range: String,
        rate: Number,
        liters: Number,
        cost: Number
    }],
    status: {
        type: String,
        required: true,
        enum: ['Paid', 'Unpaid'],
        default: 'Unpaid'
    },
    paymentId: {
        type: String
    },
    razorpayOrderId: {
        type: String
    },
    razorpayPaymentId: {
        type: String
    }
}, {
    timestamps: true
});

const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;
