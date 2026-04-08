const express = require('express');
const router = express.Router();
const {
    generateBill,
    getMyBills,
    getBillById,
    payBill,
    createRazorpayOrder
} = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate/:usageId', protect, generateBill);
router.get('/', protect, getMyBills);
router.get('/:id', protect, getBillById);
router.post('/:id/order', protect, createRazorpayOrder);
router.put('/:id/pay', protect, payBill);

module.exports = router;
