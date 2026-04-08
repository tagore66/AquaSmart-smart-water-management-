const express = require('express');
const router = express.Router();
const { getAlerts, markAsRead } = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAlerts);
router.put('/:id', protect, markAsRead);

module.exports = router;
