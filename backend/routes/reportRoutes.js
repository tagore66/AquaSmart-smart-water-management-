const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { Resend } = require('resend');

// @desc    Email PDF report to user
// @route   POST /api/reports/email
// @access  Private
router.post('/email', protect, async (req, res) => {
    const { pdfBase64, weekLabel } = req.body;
    
    if (!pdfBase64) {
        return res.status(400).json({ message: 'No PDF data provided' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ message: 'Email service not configured on server' });
    }

    try {
        const resend = new Resend(apiKey);

        const { data, error } = await resend.emails.send({
            from: 'AquaSmart Reports <onboarding@resend.dev>',
            to: req.user.email,
            subject: `Water Usage Report - ${weekLabel}`,
            text: `Hello ${req.user.firstName},\n\nPlease find attached your water usage report for the week of ${weekLabel}.\n\nStay sustainable!\nTeam AquaSmart`,
            attachments: [
                {
                    filename: `AquaSmart_Report_${weekLabel.replace(/ /g, '_')}.pdf`,
                    content: pdfBase64.split('base64,')[1],
                }
            ]
        });

        if (error) {
            console.error('Resend report email error:', error);
            return res.status(500).json({ message: `Email failed: ${error.message}` });
        }

        console.log('Report email sent successfully. ID:', data.id);
        res.json({ message: 'Report emailed successfully!' });
    } catch (error) {
        console.error('Email report error:', error.message);
        res.status(500).json({ message: `Email failed: ${error.message}` });
    }
});

module.exports = router;
