const express = require('express');
const { 
  getEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  getRelatedEvents 
} = require('../controllers/calendarController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes need authentication
router.use(protect);

/**
 * @swagger
 * /api/calendar/events:
 *   get:
 *     summary: Get all calendar events
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CalendarEvent'
 *   post:
 *     summary: Create a new calendar event
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               eventType:
 *                 type: string
 *               relatedId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Calendar event created successfully
 */
router.route('/events')
  .get(getEvents)
  .post(createEvent);


/**
 * @swagger
 * /api/calendar/events/{id}:
 *   put:
 *     summary: Update calendar event by ID
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               eventType:
 *                 type: string
 *               relatedId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Calendar event updated successfully
 *   delete:
 *     summary: Delete calendar event by ID
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       204:
 *         description: Calendar event deleted successfully
 */
router.route('/events/:id')
  .put(updateEvent)
  .delete(deleteEvent);


/**
 * @swagger
 * /api/calendar/related:
 *   get:
 *     summary: Get related calendar events
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/related', getRelatedEvents);

module.exports = router;
