const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // For production, use real SMTP settings in .env
    // For development, you can use Ethereal or a Gmail App Password
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: process.env.SMTP_PORT || 587,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const message = {
        from: `${process.env.FROM_NAME || 'Lead CRM'} <${process.env.FROM_EMAIL || 'noreply@leadcrm.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
    return info;
};

module.exports = sendEmail;
