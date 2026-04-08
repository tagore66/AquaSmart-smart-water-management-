// utils/emailService.js

const nodemailer = require('nodemailer');

let transporter;
try {
    transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
} catch (error) {
    console.warn('Transporter initialization failed, using mock mode.');
}

const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: `Aqua Smart <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html
        };

        const isMockMode = !process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your-email');
        const info = (isMockMode || !transporter) 
            ? { messageId: 'MOCK_ID_' + Date.now() } 
            : await transporter.sendMail(mailOptions);
        
        console.log('--- [EMAIL SYSTEM LOG] ---');
        console.log('From: %s', process.env.EMAIL_USER);
        console.log('To: %s', options.email);
        console.log('Subject: %s', options.subject);
        console.log('Status: %s', isMockMode ? 'Success (DRY RUN / MOCK)' : 'Success (SENT)');
        console.log('----------------------------');
        
        return info;
    } catch (error) {
        console.error('Email sending failed:', error.message);
        throw error;
    }
};

module.exports = sendEmail;