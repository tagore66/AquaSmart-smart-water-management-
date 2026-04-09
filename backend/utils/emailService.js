// utils/emailService.js
const Brevo = require('@getbrevo/brevo');

const sendEmail = async (options) => {
    console.log('[EMAIL INITIATING] To:', options.email);

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
        console.error('[EMAIL ERROR] BREVO_API_KEY is missing in environment variables!');
        throw new Error('Email service not configured (missing BREVO_API_KEY).');
    }

    try {
        let defaultClient = Brevo.ApiClient.instance;
        let apiKeyAuth = defaultClient.authentications['api-key'];
        apiKeyAuth.apiKey = apiKey;

        let apiInstance = new Brevo.TransactionalEmailsApi();
        let sendSmtpEmail = new Brevo.SendSmtpEmail();

        sendSmtpEmail.subject = options.subject;
        sendSmtpEmail.htmlContent = options.html || `<html><body><p>${options.message}</p></body></html>`;
        sendSmtpEmail.sender = { "name": "Aqua Smart", "email": "aquasmart.management@gmail.com" };
        sendSmtpEmail.to = [{ "email": options.email }];
        
        if (options.message && !options.html) {
            sendSmtpEmail.textContent = options.message;
        }

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

        console.log('--- [EMAIL SYSTEM LOG] ---');
        console.log('Status: Success (SENT via Brevo)');
        console.log('Message ID:', data.messageId);
        console.log('----------------------------');

        return data;
    } catch (error) {
        console.error('--- [EMAIL SYSTEM FATAL ERROR] ---');
        console.error('Email report error:', error.message);
        if (error.response && error.response.body) {
            console.error('Brevo API Error Detail:', JSON.stringify(error.response.body, null, 2));
        }
        throw error;
    }
};

module.exports = sendEmail;