const axios = require('axios');
const prisma = require('../config/db');
const AppError = require('../utils/appError');
const { PAGINATION } = require('../config/constants');

// Placeholder for the N8N webhook URL to send user replies to
const N8N_REPLY_WEBHOOK_URL = process.env.N8N_REPLY_WEBHOOK_URL || 'YOUR_N8N_REPLY_WEBHOOK_URL_HERE';

// Handle incoming messages from the N8N Webhook
exports.handleWebhookMessage = async (req, res, next) => {
  try {
    // Note: This endpoint should ideally be secured (e.g., with a secret token)
    // to ensure only your n8n workflow can call it.
    const { message, contactId, estimateId, userId } = req.body;

    if (!message || !contactId || !userId) {
      // Log the error for debugging, but send a generic success to n8n
      console.error('Webhook Error: Missing required fields (message, contactId, userId)', req.body);
      // Send 200 OK to n8n even if data is missing to prevent retries,
      // but log the error server-side. Adjust based on n8n workflow needs.
      return res.status(200).json({ success: true, message: 'Received, but missing required fields.' });
    }

    // Validate if the user exists (optional but recommended)
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      console.error(`Webhook Error: User with ID ${userId} not found.`);
      return res.status(200).json({ success: true, message: 'Received, but user not found.' });
    }

    // Validate if the contact exists and belongs to the user (optional but recommended)
    const contactExists = await prisma.contact.findFirst({ where: { id: contactId, createdBy: userId } });
    if (!contactExists) {
        console.error(`Webhook Error: Contact with ID ${contactId} not found or doesn't belong to user ${userId}.`);
        return res.status(200).json({ success: true, message: 'Received, but contact not found or invalid.' });
    }

    // Validate estimateId if provided (optional but recommended)
    if (estimateId) {
        const estimateExists = await prisma.estimate.findFirst({ where: { id: estimateId, createdBy: userId, clientId: contactId } });
        if (!estimateExists) {
            console.error(`Webhook Error: Estimate with ID ${estimateId} not found or doesn't belong to contact ${contactId} / user ${userId}.`);
            return res.status(200).json({ success: true, message: 'Received, but estimate not found or invalid.' });
        }
    }


    // Save the AI message
    const aiMessage = await prisma.aiMessage.create({
      data: {
        message,
        senderType: 'AI',
        userId, // The user the message is intended for
        contactId,
        estimateId: estimateId || null, // Ensure it's null if not provided
      }
    });

    // Implement real-time notification to the frontend via WebSockets
    const { broadcast } = require('../server'); // Import the broadcast function
    broadcast({ type: 'newMessage', data: aiMessage });

    res.status(200).json({ success: true, message: 'AI message received and saved.', data: aiMessage });
  } catch (error) {
    console.error("Error in handleWebhookMessage:", error);
    // Send 200 OK to n8n to prevent retries, but log the internal error
    res.status(200).json({ success: true, message: 'Received, but internal server error occurred.' });
    // Optionally, use next(error) if you want Express error handling,
    // but this might cause issues with n8n expecting a 200 OK.
  }
};

// Get conversation history for a specific contact or estimate
exports.getConversation = async (req, res, next) => {
  try {
    const { contactId, estimateId } = req.params;
    const userId = req.user.id; // Get user ID from authenticated request

    let whereClause = { userId }; // Base filter: messages for the authenticated user

    if (contactId) {
      whereClause.contactId = contactId;
    } else if (estimateId) {
      whereClause.estimateId = estimateId;
    } else {
      return next(new AppError('Please provide either a contactId or estimateId', 400));
    }

    // Validate that the contact/estimate belongs to the user
    if (contactId) {
        const contact = await prisma.contact.findFirst({ where: { id: contactId, createdBy: userId } });
        if (!contact) return next(new AppError('Contact not found or access denied', 404));
    }
    if (estimateId) {
        const estimate = await prisma.estimate.findFirst({ where: { id: estimateId, createdBy: userId } });
        if (!estimate) return next(new AppError('Estimate not found or access denied', 404));
        // Optionally ensure estimate belongs to the contact if both are somehow provided
        if (contactId && estimate.clientId !== contactId) {
             return next(new AppError('Estimate does not belong to the specified contact', 400));
        }
        // If only estimateId is provided, ensure contactId in whereClause matches
        whereClause.contactId = estimate.clientId;
    }


    const messages = await prisma.aiMessage.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' }, // Show oldest messages first
      include: {
        user: { select: { id: true, name: true } }, // Include sender info if needed
        contact: { select: { id: true, name: true } },
        estimate: { select: { id: true } }
      }
    });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
      contactId: contactId || null,
      estimateId: estimateId || null
    });
  } catch (error) {
    next(error);
  }
};

// Handle a user replying to the AI
exports.handleUserReply = async (req, res, next) => {
  try {
    const { message, contactId, estimateId } = req.body;
    const userId = req.user.id;

    if (!message || !contactId) {
      return next(new AppError('Please provide a message and contactId', 400));
    }

    // Validate contact exists and belongs to user
    const contact = await prisma.contact.findFirst({ where: { id: contactId, createdBy: userId } });
    if (!contact) {
        return next(new AppError('Contact not found or access denied', 404));
    }

    // Validate estimate if provided
    let validEstimateId = null;
    if (estimateId) {
        const estimate = await prisma.estimate.findFirst({ where: { id: estimateId, createdBy: userId, clientId: contactId } });
        if (!estimate) {
            return next(new AppError('Estimate not found or does not belong to this contact', 404));
        }
        validEstimateId = estimate.id;
    }

    // 1. Save the user's message
    const userMessage = await prisma.aiMessage.create({
      data: {
        message,
        senderType: 'USER',
        userId,
        contactId,
        estimateId: validEstimateId,
      }
    });

    // 2. Trigger the N8N workflow to get the AI's response
    if (N8N_REPLY_WEBHOOK_URL === 'YOUR_N8N_REPLY_WEBHOOK_URL_HERE') {
        console.warn("N8N_REPLY_WEBHOOK_URL is not configured. Skipping AI response trigger.");
        // Optionally return here or proceed without triggering AI
         return res.status(201).json({
            success: true,
            message: 'User message saved. AI response trigger skipped (Webhook URL not configured).',
            data: userMessage
        });
    }

    try {
        await axios.post(N8N_REPLY_WEBHOOK_URL, {
            userId,
            contactId,
            estimateId: validEstimateId,
            message // The user's message
            // Include any other context n8n needs, like conversation history summary
        });
         console.log(`Triggered N8N reply webhook for contact ${contactId}`);
    } catch (webhookError) {
        console.error("Error triggering N8N reply webhook:", webhookError.message);
        // Decide how to handle webhook failure. Maybe log it but still return success for the saved message.
        // Or return an error to the user.
        return next(new AppError('Message saved, but failed to trigger AI response.', 500));
    }


    res.status(201).json({
      success: true,
      message: 'User message saved and AI response triggered.',
      data: userMessage // Return the saved user message
    });
  } catch (error) {
    next(error);
  }
};


// Clear conversation history (kept for potential admin/debug use, adjust as needed)
// Consider adding filters (by contactId, estimateId) if needed for granular clearing
exports.clearConversationHistory = async (req, res, next) => {
  try {
    // WARNING: This clears ALL AI messages for the user. Be cautious.
    // Add contactId/estimateId filters if needed.
    // Example: const { contactId } = req.query;
    // const whereClause = { userId: req.user.id };
    // if (contactId) whereClause.contactId = contactId;

    await prisma.aiMessage.deleteMany({
      where: { userId: req.user.id } // Only clear for the logged-in user
    });

    res.status(200).json({
      success: true,
      message: 'User\'s conversation history cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get a list of all conversations for the logged-in user
exports.getConversationList = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find all distinct contactId and estimateId for the user's messages
    const distinctConversations = await prisma.aiMessage.findMany({
      where: { userId },
      select: {
        contactId: true,
        estimateId: true,
      },
      distinct: ['contactId', 'estimateId'],
    });

    const conversationList = [];

    for (const convo of distinctConversations) {
      let lastMessage;
      let relatedEntity;

      if (convo.contactId && convo.estimateId) {
        // Case 1: Message is linked to both a contact and an estimate
        lastMessage = await prisma.aiMessage.findFirst({
          where: {
            userId,
            contactId: convo.contactId,
            estimateId: convo.estimateId,
          },
          orderBy: { createdAt: 'desc' },
        });
        relatedEntity = await prisma.estimate.findUnique({
            where: { id: convo.estimateId },
            select: { id: true, leadName: true, clientId: true }
        });
        // Ensure the estimate belongs to the contact and user
        if (!relatedEntity || relatedEntity.clientId !== convo.contactId) {
             continue; // Skip if estimate is invalid or doesn't match contact
        }

      } else if (convo.contactId && !convo.estimateId) {
        // Case 2: Message is linked only to a contact (general contact conversation)
        // Find the last message for this contact that is NOT linked to an estimate
         lastMessage = await prisma.aiMessage.findFirst({
            where: {
                userId,
                contactId: convo.contactId,
                estimateId: null, // Explicitly look for messages NOT linked to an estimate
            },
            orderBy: { createdAt: 'desc' },
         });
         relatedEntity = await prisma.contact.findUnique({
            where: { id: convo.contactId },
            select: { id: true, name: true }
         });
         // Ensure the contact belongs to the user
         if (!relatedEntity) {
            continue; // Skip if contact is invalid
         }

      } else if (convo.estimateId && !convo.contactId) {
           // This case should ideally not happen based on schema (estimate requires clientId),
           // but including for robustness.
           console.warn(`Found AiMessage with estimateId ${convo.estimateId} but no contactId for user ${userId}. Skipping.`);
           continue; // Skip messages with estimateId but no contactId
      } else {
          // Should not happen if distinct query works correctly, but for safety
          continue;
      }


      if (lastMessage && relatedEntity) {
        conversationList.push({
          contactId: convo.contactId,
          estimateId: convo.estimateId,
          contactName: relatedEntity.name || null, // Use contact name if available
          estimateLeadName: relatedEntity.leadName || null, // Use estimate lead name if available
          lastMessage,
        });
      }
    }

    // Sort conversations by the timestamp of the last message (most recent first)
    conversationList.sort((a, b) => b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime());


    res.status(200).json({
      success: true,
      count: conversationList.length,
      data: conversationList,
    });
  } catch (error) {
    next(error);
  }
};
