require('dotenv').config();
const sendEmail = require('./utils/emailService');

const test = async () => {
    try {
        await sendEmail({
            email: 'manoj.23bce9809@vitapstudent.ac.in',
            subject: 'System Test',
            message: 'Testing email functionality with current .env settings.',
            html: '<h1>System Test Success</h1><p>This is a test from the AquaSmart integration.</p>'
        });
        console.log('✅ Test email SENT successfully');
    } catch (error) {
        console.error('❌ Test email FAILED');
    }
};

test();
