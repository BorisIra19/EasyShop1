"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailConfig = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
// Ensure .env is loaded
dotenv_1.default.config();
// Create transporter with fallback defaults
const createTransporter = () => {
    // Log what we're getting from environment
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const emailPort = parseInt(process.env.EMAIL_PORT || '587');
    const config = {
        host: emailHost,
        port: emailPort,
        secure: process.env.EMAIL_SECURE === 'true' || false,
        auth: {
            user: emailUser,
            pass: emailPass,
        },
    };
    // Log configuration (without passwords)
    console.log('Email Configuration:', {
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: emailUser ? '***' : 'NOT SET',
        pass: emailPass ? '***' : 'NOT SET',
    });
    return nodemailer_1.default.createTransport(config);
};
const transporter = createTransporter();
const sendEmail = async (to, subject, text, html) => {
    try {
        // Validate email configuration
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('Email service not configured. Skipping email send.');
            console.log(`[EMAIL LOG] To: ${to}, Subject: ${subject}`);
            return;
        }
        const mailOptions = {
            from: process.env.EMAIL_FROM || `"EasyShop" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html: html || `<p>${text.replace(/\n/g, '<br>')}</p>`,
        };
        console.log('Sending email to:', to, 'Subject:', subject);
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
    }
    catch (error) {
        console.error('Email send error:', error.message);
        console.error('Full error:', error);
        // Don't throw - allow application to continue even if email fails
        return null;
    }
};
exports.sendEmail = sendEmail;
// Verify transporter connection
const verifyEmailConfig = async () => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('⚠️  Email service not configured. Set EMAIL_USER and EMAIL_PASS in .env');
            return false;
        }
        // Add timeout to prevent hanging
        const verifyPromise = transporter.verify();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Email verification timeout')), 5000));
        await Promise.race([verifyPromise, timeoutPromise]);
        console.log('✓ Email service configured and verified');
        return true;
    }
    catch (error) {
        console.warn('⚠️  Email verification failed or timeout:', error.message);
        console.warn('⚠️  App will continue without email service');
        return false;
    }
};
exports.verifyEmailConfig = verifyEmailConfig;
//# sourceMappingURL=email.js.map