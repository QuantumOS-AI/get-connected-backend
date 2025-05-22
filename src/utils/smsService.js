const { logger } = require('./logger');

/**
 * SMS Service Utility
 * 
 * This utility provides functions to send SMS notifications.
 * It's designed to be easily configurable with different SMS providers.
 * 
 * Currently, it's set up with a placeholder implementation that logs messages
 * but doesn't actually send SMS. To enable real SMS sending, you'll need to:
 * 
 * 1. Install an SMS provider SDK (e.g., twilio, nexmo, etc.)
 * 2. Configure the provider with your credentials
 * 3. Implement the actual SMS sending logic
 * 
 * Example implementation with Twilio:
 * ```
 * const twilio = require('twilio');
 * const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
 * 
 * exports.sendSMS = async (to, message) => {
 *   try {
 *     const result = await client.messages.create({
 *       body: message,
 *       from: process.env.TWILIO_PHONE_NUMBER,
 *       to
 *     });
 *     logger.info(`SMS sent: ${result.sid}`);
 *     return true;
 *   } catch (error) {
 *     logger.error(`Error sending SMS: ${error.message}`);
 *     return false;
 *   }
 * };
 * ```
 */

/**
 * Send an SMS
 * @param {string} to - Recipient phone number
 * @param {string} message - SMS message content
 * @returns {Promise<boolean>} - True if SMS was sent successfully, false otherwise
 */
exports.sendSMS = async (to, message) => {
  try {
    if (!to) {
      logger.warn('No recipient phone number provided for SMS notification');
      return false;
    }

    // Placeholder implementation - just logs the message
    // Replace this with actual SMS sending logic using your preferred provider
    logger.info(`[SMS PLACEHOLDER] To: ${to}, Message: ${message}`);
    
    // For actual implementation, uncomment and modify the code below:
    /*
    // Example with Twilio
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    logger.info(`SMS sent: ${result.sid}`);
    */
    
    return true;
  } catch (error) {
    logger.error(`Error sending SMS: ${error.message}`);
    return false;
  }
};

/**
 * Send a notification SMS
 * @param {string} to - Recipient phone number
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @returns {Promise<boolean>} - True if SMS was sent successfully, false otherwise
 */
exports.sendNotificationSMS = async (to, title, message) => {
  // Format the SMS content - keep it concise for SMS
  const smsContent = `${title}: ${message}`;
  
  return await exports.sendSMS(to, smsContent);
};
