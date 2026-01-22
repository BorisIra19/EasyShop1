import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Ensure .env is loaded
dotenv.config();

// Create transporter with fallback defaults
const createTransporter = () => {
  // Log what we're getting from environment
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = parseInt(process.env.EMAIL_PORT || '587');

  const config: any = {
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

  return nodemailer.createTransport(config);
};

const transporter = createTransporter();

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
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
  } catch (error: any) {
    console.error('Email send error:', error.message);
    console.error('Full error:', error);
    // Don't throw - allow application to continue even if email fails
    return null;
  }
};

// Verify transporter connection
export const verifyEmailConfig = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️  Email service not configured. Set EMAIL_USER and EMAIL_PASS in .env');
      return false;
    }

    await transporter.verify();
    console.log('✓ Email service configured and verified');
    return true;
  } catch (error: any) {
    console.error('✗ Email verification failed:', error.message);
    return false;
  }
};
