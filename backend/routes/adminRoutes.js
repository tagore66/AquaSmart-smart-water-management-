const express = require('express');
const router = express.Router();
const { getSystemStats, getAllUsers } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getSystemStats);
router.get('/users', protect, admin, getAllUsers);

module.exports = router;
