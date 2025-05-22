const express = require('express');
const { 
  getNotificationSettings, 
  updateNotificationSettings, 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes need authentication
router.use(protect);

/**
 * @swagger
 * /api/notifications/settings:
 *   get:
 *     summary: Get notification settings for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                       eventType:
 *                         type: string
 *                       emailEnabled:
 *                         type: boolean
 *                       smsEnabled:
 *                         type: boolean
 *                       appEnabled:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *   put:
 *     summary: Update notification settings for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               settings:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     eventType:
 *                       type: string
 *                       description: The type of notification event
 *                     emailEnabled:
 *                       type: boolean
 *                       description: Whether email notifications are enabled
 *                     smsEnabled:
 *                       type: boolean
 *                       description: Whether SMS notifications are enabled
 *                     appEnabled:
 *                       type: boolean
 *                       description: Whether in-app notifications are enabled
 *     responses:
 *       200:
 *         description: Notification settings updated successfully
 */
router.route('/settings')
  .get(getNotificationSettings)
  .put(updateNotificationSettings);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination (optional, defaults to 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of notifications per page (optional, defaults to 10)
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status (optional)
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                       title:
 *                         type: string
 *                       message:
 *                         type: string
 *                       eventType:
 *                         type: string
 *                       isRead:
 *                         type: boolean
 *                       relatedId:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/', getNotifications);

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.put('/read-all', markAllAsRead);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
router.put('/:id/read', markAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 */
router.delete('/:id', deleteNotification);

module.exports = router;
