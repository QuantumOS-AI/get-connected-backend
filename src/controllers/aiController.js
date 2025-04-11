const prisma = require('../config/db');
const AppError = require('../utils/appError');
const { PAGINATION } = require('../config/constants');

// Process a message and get a response
exports.processMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return next(new AppError('Please provide a message', 400));
    }

    // Mock AI response (in a real app, this would call an AI service)
    const response = `This is a simulated AI response to: "${message}"
    
As your digital worker manager, I can help you with tasks like:
- Managing your jobs and estimates
- Organizing your contacts
- Scheduling appointments
- Providing business insights
    
What specific help do you need today?`;

    // Save the message and response
    const aiMessage = await prisma.aiMessage.create({
      data: {
        message,
        response,
        userId: req.user.id
      }
    });

    res.status(200).json({
      success: true,
      data: aiMessage
    });
  } catch (error) {
    next(error);
  }
};

// Get conversation history
exports.getConversationHistory = async (req, res, next) => {
  try {
    const { 
      page = PAGINATION.DEFAULT_PAGE, 
      limit = PAGINATION.DEFAULT_LIMIT 
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);

    // Count total messages
    const total = await prisma.aiMessage.count({
      where: { userId: req.user.id }
    });

    // Get messages with pagination
    const messages = await prisma.aiMessage.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    });

    res.status(200).json({
      success: true,
      data: messages,
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

// Clear conversation history
exports.clearConversationHistory = async (req, res, next) => {
  try {
    await prisma.aiMessage.deleteMany({
      where: { userId: req.user.id }
    });

    res.status(200).json({
      success: true,
      message: 'Conversation history cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};
