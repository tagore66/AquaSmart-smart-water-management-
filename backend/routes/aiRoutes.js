const express = require('express');
const router = express.Router();
const { analyzeUsage, chatWithAI, generateFullReport } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze', protect, analyzeUsage);
router.post('/chat', protect, chatWithAI);
router.post('/report', protect, generateFullReport);

module.exports = router;
