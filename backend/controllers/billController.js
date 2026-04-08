const Bill = require('../models/Bill');
const WaterUsage = require('../models/WaterUsage');
const calculateBill = require('../utils/billCalculator');
const sendEmail = require('../utils/emailService');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Generate a bill for a usage record
// @route   POST /api/bills/generate/:usageId
// @access  Private
const generateBill = async (req, res) => {
    const usage = await WaterUsage.findById(req.params.usageId);

    if (!usage) {
        return res.status(404).json({ message: 'Usage record not found' });
    }

    const { totalCost, slabBreakdown } = calculateBill(usage.totalLiters);

    const bill = new Bill({
        user: req.user._id,
        usage: usage._id,
        amount: totalCost,
        slabBreakdown
    });

    const createdBill = await bill.save();
    res.status(201).json(createdBill);
};

// @desc    Get user bills
// @route   GET /api/bills
// @access  Private
const getMyBills = async (req, res) => {
    const bills = await Bill.find({ user: req.user._id }).populate('usage').sort({ createdAt: -1 });
    res.json(bills);
};

// @desc    Get bill details
// @route   GET /api/bills/:id
// @access  Private
const getBillById = async (req, res) => {
    const bill = await Bill.findById(req.params.id).populate('usage');

    if (bill) {
        res.json(bill);
    } else {
        res.status(404).json({ message: 'Bill not found' });
    }
};

// @desc    Create Razorpay Order
// @route   POST /api/bills/:id/order
// @access  Private
const createRazorpayOrder = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id);

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        const options = {
            amount: Math.round(bill.amount * 100), // amount in paise
            currency: 'INR',
            receipt: `receipt_bill_${bill._id}`,
        };

        const order = await razorpay.orders.create(options);
        
        bill.razorpayOrderId = order.id;
        await bill.save();

        res.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Razorpay order creation failed:', error);
        res.status(500).json({ message: 'Order creation failed', error: error.message });
    }
};

// @desc    Pay a bill
// @route   PUT /api/bills/:id/pay
// @access  Private
const payBill = async (req, res) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    const bill = await Bill.findById(req.params.id);

    if (bill) {
        // Verification (Optional but recommended)
        if (razorpay_signature) {
            const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
            hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
            const generated_signature = hmac.digest('hex');

            if (generated_signature !== razorpay_signature) {
                return res.status(400).json({ message: 'Payment verification failed' });
            }
        }

        bill.status = 'Paid';
        bill.paymentId = razorpay_payment_id || 'pay_mock_' + Math.random().toString(36).substr(2, 9);
        bill.razorpayPaymentId = razorpay_payment_id;
        
        const updatedBill = await bill.save();

        // Send Email Notification (fire-and-forget so user isn't blocked)
        sendEmail({
            email: req.user.email,
            subject: 'Payment Successful - Aqua Smart',
            message: `Hi ${req.user.firstName},\n\nThank you for your payment. Your bill of ₹${bill.amount} has been successfully settled.\n\nPayment ID: ${bill.paymentId}\nStatus: Completed\n\nThanks for being an eco-conscious user!\n\nAqua Smart Team`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #2563eb;">Payment Successful!</h2>
                    <p>Hi <strong>${req.user.firstName}</strong>,</p>
                    <p>Thank you for your payment. Your bill has been successfully settled.</p>
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ₹${bill.amount}</p>
                        <p style="margin: 5px 0;"><strong>Payment ID:</strong> ${bill.paymentId}</p>
                        <p style="margin: 5px 0;"><strong>Status:</strong> Completed</p>
                    </div>
                    <p>Thanks for being an eco-conscious user!</p>
                    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                    <p style="font-size: 12px; color: #6b7280;">This is an automated message from Aqua Smart. Please do not reply.</p>
                </div>
            `
        }).catch(err => console.error('Payment email failed:', err.message));

        res.json(updatedBill);
    } else {
        res.status(404).json({ message: 'Bill not found' });
    }
};

module.exports = {
    generateBill,
    getMyBills,
    getBillById,
    payBill,
    createRazorpayOrder
};
