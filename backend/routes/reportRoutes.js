const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');

// @desc    Email PDF report to user
// @route   POST /api/reports/email
// @access  Private
router.post('/email', protect, async (req, res) => {
    const { pdfBase64, weekLabel } = req.body;
    
    if (!pdfBase64) {
        return res.status(400).json({ message: 'No PDF data provided' });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"AquaSmart Reports" <${process.env.EMAIL_USER}>`,
            to: req.user.email,
            subject: `Water Usage Report - ${weekLabel}`,
            text: `Hello ${req.user.firstName},\n\nPlease find attached your water usage report for the week of ${weekLabel}.\n\nStay sustainable!\nTeam AquaSmart`,
            attachments: [
                {
                    filename: `AquaSmart_Report_${weekLabel.replace(/ /g, '_')}.pdf`,
                    content: pdfBase64.split('base64,')[1],
                    encoding: 'base64'
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Report emailed successfully!' });
    } catch (error) {
        console.error('Email report detailed error:', {
            message: error.message,
            code: error.code,
            command: error.command,
            stack: error.stack
        });
        
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return res.status(500).json({ message: 'Email service not configured on server' });
        }

        res.status(500).json({ message: `Email failed: ${error.message}` });
    }
});

module.exports = router;
