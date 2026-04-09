const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const axios = require('axios');

// @desc    Email PDF report to user
// @route   POST /api/reports/email
// @access  Private
router.post('/email', protect, async (req, res) => {
    const { pdfBase64, weekLabel } = req.body;
    
    if (!pdfBase64) {
        return res.status(400).json({ message: 'No PDF data provided' });
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ message: 'Email service not configured on server' });
    }

    try {
        // More robust base64 cleaning
        const base64Data = pdfBase64.includes('base64,') 
            ? pdfBase64.split('base64,')[1] 
            : pdfBase64;

        console.log(`[ATTACHMENT DEBUG] Size: ${(base64Data.length / 1024).toFixed(2)} KB`);

        const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
            sender: { name: "AquaSmart Reports", email: "aquasmart.management@gmail.com" },
            to: [{ email: req.user.email }],
            subject: `Water Usage Report - ${weekLabel}`,
            htmlContent: `
                <html>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h2 style="color: #2563eb;">Hello ${req.user.firstName},</h2>
                        <p>Please find attached your comprehensive water usage report for the week of <strong>${weekLabel}</strong>.</p>
                        <p>This report includes your consumption breakdown, AI-powered conservation tips, and your current billing status.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 14px; color: #666;">Stay sustainable!<br><strong>Team AquaSmart</strong></p>
                    </body>
                </html>
            `,
            attachment: [{
                content: base64Data,
                name: `AquaSmart_Report_${weekLabel.replace(/ /g, '_')}.pdf`
            }]
        }, {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('Report email sent successfully. ID:', response.data.messageId);
        res.json({ message: 'Report emailed successfully!' });
    } catch (error) {
        console.error('Email report error:', error.message);
        if (error.response && error.response.data) {
            console.error('Brevo API Error Detail:', JSON.stringify(error.response.data, null, 2));
        }
        res.status(500).json({ message: `Email failed: ${error.message}` });
    }
});

module.exports = router;
