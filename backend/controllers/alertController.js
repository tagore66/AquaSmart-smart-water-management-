const Alert = require('../models/Alert');

// @desc    Get user alerts
// @route   GET /api/alerts
// @access  Private
const getAlerts = async (req, res) => {
    const alerts = await Alert.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(alerts);
};

// @desc    Mark alert as read
// @route   PUT /api/alerts/:id
const markAsRead = async (req, res) => {
    const alert = await Alert.findById(req.params.id);
    if (alert) {
        alert.isRead = true;
        await alert.save();
        res.json({ message: 'Alert marked as read' });
    } else {
        res.status(404).json({ message: 'Alert not found' });
    }
};

module.exports = {
    getAlerts,
    markAsRead
};
