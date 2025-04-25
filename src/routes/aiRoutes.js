const express = require('express');
const {
  handleWebhookMessage,
  getConversation,
  handleUserReply,
  clearConversationHistory, // Keep if needed, otherwise remove
  getConversationList
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// --- Webhook Endpoint (No Authentication - Secure Separately!) ---
/**
 * @swagger
 * /api/ai/webhook/message:
 *   post:
 *     summary: Webhook endpoint for receiving messages from the AI (e.g., n8n)
 *     tags: [AI Webhook]
 *     description: >
 *       This endpoint receives messages initiated by the AI agent.
 *       It should be secured using a mechanism like a secret token validation
 *       in the `handleWebhookMessage` controller, as it's not protected by user login.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The content of the AI's message.
 *               contactId:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the contact this message relates to.
 *               estimateId:
 *                 type: string
 *                 format: uuid
 *                 description: (Optional) The ID of the estimate this message relates to.
 *               userId:
 *                  type: string
 *                  format: uuid
 *                  description: The ID of the user this message is intended for.
 *             required:
 *               - message
 *               - contactId
 *               - userId
 *     responses:
 *       200:
 *         description: Message received successfully (even if processing fails internally, to prevent webhook retries).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/webhook/message', handleWebhookMessage); // Note: No 'protect' middleware here

// --- Authenticated Routes ---
router.use(protect); // Apply authentication middleware to all subsequent routes

/**
 * @swagger
 * /api/ai/reply:
 *   post:
 *     summary: Send a reply message from the user to the AI conversation
 *     tags: [AI Conversation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The user's reply message content.
 *               contactId:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the contact the user is replying about.
 *               estimateId:
 *                 type: string
 *                 format: uuid
 *                 description: (Optional) The ID of the specific estimate being discussed.
 *             required:
 *               - message
 *               - contactId
 *     responses:
 *       201:
 *         description: User message saved and AI response triggered.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AiMessage' # Assuming AiMessage schema exists
 *       400:
 *         description: Bad request (e.g., missing fields)
 *       404:
 *         description: Contact or Estimate not found or access denied
 *       500:
 *         description: Internal server error (e.g., failed to trigger webhook)
 */
router.post('/reply', handleUserReply);

/**
 * @swagger
 * /api/ai/conversation/contact/{contactId}:
 *   get:
 *     summary: Get conversation history for a specific contact
 *     tags: [AI Conversation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the contact whose conversation history is needed.
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
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AiMessage' # Assuming AiMessage schema exists
 *       400:
 *         description: Bad request (missing contactId)
 *       404:
 *         description: Contact not found or access denied
 */
router.get('/conversation/contact/:contactId', getConversation);

/**
 * @swagger
 * /api/ai/conversation/estimate/{estimateId}:
 *   get:
 *     summary: Get conversation history specifically related to an estimate
 *     tags: [AI Conversation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: estimateId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the estimate whose conversation history is needed.
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
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AiMessage' # Assuming AiMessage schema exists
 *       400:
 *         description: Bad request (missing estimateId or estimate doesn't belong to contact)
 *       404:
 *         description: Estimate not found or access denied
 */
router.get('/conversation/estimate/:estimateId', getConversation);

/**
 * @swagger
 * /api/ai/conversations:
 *   get:
 *     summary: Get a list of all conversations for the logged-in user
 *     tags: [AI Conversation]
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
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       contactId:
 *                         type: string
 *                         format: uuid
 *                       estimateId:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                       contactName:
 *                         type: string
 *                         nullable: true
 *                       estimateLeadName:
 *                         type: string
 *                         nullable: true
 *                       lastMessage:
 *                         $ref: '#/components/schemas/AiMessage' # Assuming AiMessage schema exists
 *       500:
 *         description: Internal server error
 */
router.get('/conversations', getConversationList);


/**
 * @swagger
 * /api/ai/history:
 *   delete:
 *     summary: Clear ALL conversation history for the logged-in user
 *     tags: [AI Conversation]
 *     description: >
 *       WARNING: This deletes all AI messages associated with the authenticated user.
 *       Use with caution. Consider adding filters (e.g., by contactId) if needed.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversation history cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.delete('/history', clearConversationHistory); // Kept for now, adjust if needed

module.exports = router;
