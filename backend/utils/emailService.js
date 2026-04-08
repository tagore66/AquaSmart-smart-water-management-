// utils/emailService.js
const { Resend } = require('resend');

const sendEmail = async (options) => {
    console.log('[EMAIL INITIATING] To:', options.email);

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error('[EMAIL ERROR] RESEND_API_KEY is missing in environment variables!');
        throw new Error('Email service not configured (missing RESEND_API_KEY).');
    }

    try {
        const resend = new Resend(apiKey);

        const { data, error } = await resend.emails.send({
            from: 'Aqua Smart <onboarding@resend.dev>',
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html
        });

        if (error) {
            console.error('[EMAIL RESEND ERROR]', error);
            throw new Error(error.message);
        }

        console.log('--- [EMAIL SYSTEM LOG] ---');
        console.log('Status: Success (SENT via Resend)');
        console.log('Message ID:', data.id);
        console.log('----------------------------');

        return data;
    } catch (error) {
        console.error('--- [EMAIL SYSTEM FATAL ERROR] ---');
        console.error('Email sending failed:', error.message);
        throw error;
    }
};

module.exports = sendEmail;