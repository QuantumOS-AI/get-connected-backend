const nodemailer = require('nodemailer');
const { logger } = require('./logger');

// Configure transporter with environment variables
// This can be configured with various email providers like SendGrid, AWS SES, etc.
const createTransporter = () => {
  // For development/testing, you can use a test account from Ethereal
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_SERVICE) {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
        pass: process.env.EMAIL_PASSWORD || 'ethereal_pass'
      }
    });
  }

  // For production, use configured email service
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Initialize transporter
const transporter = createTransporter();

/**
 * Send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text version of the email
 * @param {string} html - HTML version of the email
 * @returns {Promise<boolean>} - True if email was sent successfully, false otherwise
 */
exports.sendEmail = async (to, subject, text, html) => {
  try {
    if (!to) {
      logger.warn('No recipient email provided for notification');
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Get Connected" <notifications@getconnected.com>',
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    
    // For development, log the test URL
    if (process.env.NODE_ENV === 'development' && info.testMessageUrl) {
      logger.info(`Preview URL: ${info.testMessageUrl}`);
    }
    
    return true;
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
    return false;
  }
};

/**
 * Send a notification email
 * @param {string} to - Recipient email address
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @returns {Promise<boolean>} - True if email was sent successfully, false otherwise
 */
exports.sendNotificationEmail = async (to, title, message) => {
  const subject = `Get Connected: ${title}`;
  const text = message;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h1 style="color: #4a6ee0;">${title}</h1>
      <p style="font-size: 16px; line-height: 1.5;">${message}</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
        <p>This is an automated notification from Get Connected. Please do not reply to this email.</p>
        <p>To manage your notification preferences, log in to your account and visit the notification settings page.</p>
      </div>
    </div>
  `;
  
  return await exports.sendEmail(to, subject, text, html);
};
