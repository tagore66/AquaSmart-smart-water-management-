const User = require('../models/User');
const WaterUsage = require('../models/WaterUsage');
const Bill = require('../models/Bill');

// @desc    Get all system stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getSystemStats = async (req, res) => {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalUsage = await WaterUsage.aggregate([
        { $group: { _id: null, total: { $sum: '$totalLiters' } } }
    ]);
    const totalRevenue = await Bill.aggregate([
        { $match: { status: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const recentUsage = await WaterUsage.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name email');

    res.json({
        totalUsers,
        totalUsage: totalUsage[0]?.total || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentUsage
    });
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
};

module.exports = {
    getSystemStats,
    getAllUsers
};
