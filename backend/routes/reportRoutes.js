const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Brevo = require('@getbrevo/brevo');

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
        let defaultClient = Brevo.ApiClient.instance;
        let apiKeyAuth = defaultClient.authentications['api-key'];
        apiKeyAuth.apiKey = apiKey;

        let apiInstance = new Brevo.TransactionalEmailsApi();
        let sendSmtpEmail = new Brevo.SendSmtpEmail();

        sendSmtpEmail.subject = `Water Usage Report - ${weekLabel}`;
        sendSmtpEmail.htmlContent = `
            <html>
                <body>
                    <p>Hello ${req.user.firstName},</p>
                    <p>Please find attached your water usage report for the week of ${weekLabel}.</p>
                    <p>Stay sustainable!<br>Team AquaSmart</p>
                </body>
            </html>
        `;
        sendSmtpEmail.sender = { "name": "AquaSmart Reports", "email": "aquasmart.management@gmail.com" };
        sendSmtpEmail.to = [{ "email": req.user.email }];
        
        // Add PDF attachment
        sendSmtpEmail.attachments = [{
            "content": pdfBase64.split('base64,')[1],
            "name": `AquaSmart_Report_${weekLabel.replace(/ /g, '_')}.pdf`
        }];

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

        console.log('Report email sent successfully. ID:', data.messageId);
        res.json({ message: 'Report emailed successfully!' });
    } catch (error) {
        console.error('Email report error:', error.response ? error.response.body : error.message);
        res.status(500).json({ message: `Email failed: ${error.message}` });
    }
});

module.exports = router;
