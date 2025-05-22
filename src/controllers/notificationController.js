const prisma = require('../config/db');
const AppError = require('../utils/appError');
const { PAGINATION, NOTIFICATION_EVENT } = require('../config/constants');
const { logger } = require('../utils/logger');

/**
 * Get notification settings for the authenticated user
 */
exports.getNotificationSettings = async (req, res, next) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user.id;

    // Get notification settings for the user
    const settings = await prisma.notificationSetting.findMany({
      where: { userId }
    });

    // If no settings exist, create default settings for all notification types
    if (settings.length === 0) {
      const defaultSettings = [];
      
      // Create default settings for each notification event type
      for (const eventType of Object.values(NOTIFICATION_EVENT)) {
        defaultSettings.push({
          userId,
          eventType,
          emailEnabled: true,
          smsEnabled: false,
          appEnabled: true
        });
      }
      
      // Create default settings in the database
      await prisma.notificationSetting.createMany({
        data: defaultSettings
      });
      
      // Fetch the newly created settings
      const newSettings = await prisma.notificationSetting.findMany({
        where: { userId }
      });
      
      return res.status(200).json({
        success: true,
        data: newSettings
      });
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update notification settings for the authenticated user
 */
exports.updateNotificationSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { settings } = req.body;

    if (!settings || !Array.isArray(settings)) {
      return next(new AppError('Please provide an array of notification settings', 400));
    }

    // Process each setting in the array
    const updatedSettings = [];
    for (const setting of settings) {
      const { eventType, emailEnabled, smsEnabled, appEnabled } = setting;
      
      if (!eventType) {
        return next(new AppError('Each setting must include an eventType', 400));
      }
      
      // Check if the setting exists
      const existingSetting = await prisma.notificationSetting.findFirst({
        where: { userId, eventType }
      });
      
      let updatedSetting;
      if (existingSetting) {
        // Update existing setting
        updatedSetting = await prisma.notificationSetting.update({
          where: { id: existingSetting.id },
          data: {
            emailEnabled: emailEnabled !== undefined ? emailEnabled : existingSetting.emailEnabled,
            smsEnabled: smsEnabled !== undefined ? smsEnabled : existingSetting.smsEnabled,
            appEnabled: appEnabled !== undefined ? appEnabled : existingSetting.appEnabled
          }
        });
      } else {
        // Create new setting
        updatedSetting = await prisma.notificationSetting.create({
          data: {
            userId,
            eventType,
            emailEnabled: emailEnabled !== undefined ? emailEnabled : true,
            smsEnabled: smsEnabled !== undefined ? smsEnabled : false,
            appEnabled: appEnabled !== undefined ? appEnabled : true
          }
        });
      }
      
      updatedSettings.push(updatedSetting);
    }

    res.status(200).json({
      success: true,
      data: updatedSettings,
      message: 'Notification settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get notifications for the authenticated user
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { 
      page = PAGINATION.DEFAULT_PAGE, 
      limit = PAGINATION.DEFAULT_LIMIT,
      isRead
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    // Build where clause
    const where = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }
    
    // Count total notifications matching query
    const total = await prisma.notification.count({ where });
    
    // Get notifications with pagination
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    });
    
    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a notification as read
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // Check if notification exists and belongs to the user
    const notification = await prisma.notification.findFirst({
      where: { id, userId }
    });
    
    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }
    
    // Update notification
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
    
    res.status(200).json({
      success: true,
      data: updatedNotification,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Update all unread notifications for the user
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
    
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a notification
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // Check if notification exists and belongs to the user
    const notification = await prisma.notification.findFirst({
      where: { id, userId }
    });
    
    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }
    
    // Delete notification
    await prisma.notification.delete({
      where: { id }
    });
    
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create and send a notification
 * This is an internal function used by other controllers
 */
exports.createNotification = async (userId, eventType, title, message, relatedId = null) => {
  try {
    // Check if user has enabled this notification type
    const notificationSetting = await prisma.notificationSetting.findFirst({
      where: { userId, eventType }
    });
    
    // Get user details for email/SMS
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      logger.error(`User not found: ${userId}`);
      return null;
    }
    
    // Create in-app notification if enabled
    let notification = null;
    if (!notificationSetting || notificationSetting.appEnabled) {
      notification = await prisma.notification.create({
        data: {
          userId,
          eventType,
          title,
          message,
          relatedId,
          isRead: false
        }
      });
      
      // Send real-time notification via WebSocket
      const { broadcast } = require('../server');
      broadcast({
        type: 'notification',
        data: notification
      });
    }
    
    // Send email notification if enabled
    if (notificationSetting && notificationSetting.emailEnabled && user.email) {
      const { sendNotificationEmail } = require('../utils/emailService');
      const emailSent = await sendNotificationEmail(user.email, title, message);
      
      if (emailSent) {
        logger.info(`Email notification sent to user ${userId} (${user.email}) for event ${eventType}`);
      } else {
        logger.warn(`Failed to send email notification to user ${userId} (${user.email}) for event ${eventType}`);
      }
    }
    
    // Send SMS notification if enabled
    if (notificationSetting && notificationSetting.smsEnabled && user.phoneNumber) {
      const { sendNotificationSMS } = require('../utils/smsService');
      const smsSent = await sendNotificationSMS(user.phoneNumber, title, message);
      
      if (smsSent) {
        logger.info(`SMS notification sent to user ${userId} (${user.phoneNumber}) for event ${eventType}`);
      } else {
        logger.warn(`Failed to send SMS notification to user ${userId} (${user.phoneNumber}) for event ${eventType}`);
      }
    }
    
    return notification;
  } catch (error) {
    logger.error(`Error creating notification: ${error.message}`);
    return null;
  }
};
