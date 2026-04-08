const express = require('express');
const router = express.Router();
const {
    addWaterUsage,
    getUsageHistory,
    getLatestUsage
} = require('../controllers/usageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addWaterUsage);
router.get('/', protect, getUsageHistory);
router.get('/latest', protect, getLatestUsage);

module.exports = router;
