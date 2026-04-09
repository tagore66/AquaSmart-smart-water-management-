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
        const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
            sender: { name: "AquaSmart Reports", email: "aquasmart.management@gmail.com" },
            to: [{ email: req.user.email }],
            subject: `Water Usage Report - ${weekLabel}`,
            htmlContent: `
                <html>
                    <body>
                        <p>Hello ${req.user.firstName},</p>
                        <p>Please find attached your water usage report for the week of ${weekLabel}.</p>
                        <p>Stay sustainable!<br>Team AquaSmart</p>
                    </body>
                </html>
            `,
            attachments: [{
                content: pdfBase64.split('base64,')[1],
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
