// utils/emailService.js
const axios = require('axios');

const sendEmail = async (options) => {
    console.log('[EMAIL INITIATING] To:', options.email);

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
        console.error('[EMAIL ERROR] BREVO_API_KEY is missing in environment variables!');
        throw new Error('Email service not configured (missing BREVO_API_KEY).');
    }

    // Diagnostic log (first 10 chars)
    console.log('[DIAGNOSTIC] API Key loaded:', apiKey.substring(0, 10) + '...');

    try {
        const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
            sender: { name: "Aqua Smart", email: "aquasmart.management@gmail.com" },
            to: [{ email: options.email }],
            subject: options.subject,
            htmlContent: options.html || `<html><body><p>${options.message}</p></body></html>`,
            textContent: options.message || ""
        }, {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('--- [EMAIL SYSTEM LOG] ---');
        console.log('Status: Success (SENT via Brevo API)');
        console.log('Message ID:', response.data.messageId);
        console.log('----------------------------');

        return response.data;
    } catch (error) {
        console.error('--- [EMAIL SYSTEM FATAL ERROR] ---');
        if (error.response && error.response.data) {
            console.error('Brevo API Error Detail:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Email sending failed:', error.message);
        }
        throw error;
    }
};

module.exports = sendEmail;