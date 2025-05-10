const express = require("express");
const alliBotController = require("../controllers/alliBotController");
// const authMiddleware = require('../middleware/auth'); // Assuming you might want to protect routes later

const router = express.Router();

// Route for AlliBot to handle incoming messages
// For now, let's assume it's an open endpoint.
// If authentication is needed later, uncomment and use authMiddleware.ensureAuthenticated
router.post("/message", alliBotController.handleMessage);
// Route for N8N to send replies back to AlliBot
router.post("/n8n-reply", alliBotController.handleN8NReply);

// Route to get AlliBot conversation history for a user
router.get("/history/:userId", alliBotController.getConversationHistory);
// Example of a protected route if needed in the future:
// router.post('/secure-message', authMiddleware.ensureAuthenticated, alliBotController.handleMessage);

module.exports = router;
