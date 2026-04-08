// utils/emailService.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    console.log('[EMAIL INITIATING] To:', options.email);
    
    // Verify environment variables are present immediately before attempting to build transporter
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const service = process.env.EMAIL_SERVICE;

    if (!user || user.includes('your-email') || !pass) {
        console.error('[EMAIL ERROR] EMAIL_USER or EMAIL_PASS environment variables are missing or default in Render!');
        throw new Error('Email server is not configured correctly in Render (missing variables).');
    }

    try {
        console.log('[EMAIL] Creating Transport for:', user);
        const transporter = nodemailer.createTransport({
            service: service || 'gmail',
            auth: {
                user: user,
                pass: pass
            },
            connectionTimeout: 10000, 
            greetingTimeout: 10000,
            socketTimeout: 10000
        });

        const mailOptions = {
            from: `"Aqua Smart" <${user}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html
        };

        console.log('[EMAIL] Attempting to sendMail...');
        const info = await transporter.sendMail(mailOptions);
        
        console.log('--- [EMAIL SYSTEM LOG] ---');
        console.log('Status: Success (SENT)');
        console.log('Message ID: %s', info.messageId);
        console.log('----------------------------');
        
        return info;
    } catch (error) {
        console.error('--- [EMAIL SYSTEM FATAL ERROR] ---');
        console.error('Email sending completely failed:', error.message);
        console.error('Stack:', error.stack);
        throw error;
    }
};

module.exports = sendEmail;