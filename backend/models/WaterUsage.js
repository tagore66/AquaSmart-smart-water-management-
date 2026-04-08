const mongoose = require('mongoose');

const waterUsageSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    weekStarting: {
        type: Date,
        required: true
    },
    categories: {
        bathing: { type: Number, default: 0 },
        kitchen: { type: Number, default: 0 },
        toilet: { type: Number, default: 0 },
        washing: { type: Number, default: 0 },
        gardening: { type: Number, default: 0 }
    },
    numPeople: {
        type: Number,
        required: true,
        default: 1
    },
    totalLiters: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const WaterUsage = mongoose.model('WaterUsage', waterUsageSchema);
module.exports = WaterUsage;
