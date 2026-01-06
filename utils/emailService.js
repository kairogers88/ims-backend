const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter;

const createTransporter = () => {
    const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        console.warn('SMTP env vars missing; emails will be logged instead of sent.');
        return null;
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: SMTP_SECURE === 'true',
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    });
};

const sendEmail = async (to, subject, text) => {
    if (!transporter) {
        transporter = createTransporter();
    }

    // Fallback to console logging if transporter could not be created
    if (!transporter) {
        console.log(`[Email stub] To: ${to} | Subject: ${subject}\n${text}`);
        return;
    }

    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

    await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        text
    });
};

module.exports = sendEmail;

