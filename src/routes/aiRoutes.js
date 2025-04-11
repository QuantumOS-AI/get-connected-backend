const express = require('express');
const { 
  processMessage, 
  getConversationHistory, 
  clearConversationHistory 
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes need authentication
router.use(protect);

/**
 * @swagger
 * /api/ai/message:
 *   post:
 *     summary: Process a message with the AI
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.post('/message', processMessage);

/**
 * @swagger
 * /api/ai/history:
 *   get:
 *     summary: Get conversation history
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/history', getConversationHistory);

/**
 * @swagger
 * /api/ai/history:
 *   delete:
 *     summary: Clear conversation history
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Conversation history cleared successfully
 */
router.delete('/history', clearConversationHistory);

module.exports = router;
