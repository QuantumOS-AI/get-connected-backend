// Mock in-memory storage
let mockMessages = [];

// Send a user message
exports.handleMessage = async (req, res, next) => {
  try {
    const { message, userId } = req.body;

    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a message." });
    }
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a userId." });
    }

    const userMessage = {
      id: mockMessages.length + 1,
      message,
      senderType: "USER",
      userId,
      createdAt: new Date(),
    };

    mockMessages.push(userMessage);

    console.log(`Mock: Saved user message:`, userMessage);

    // Simulate triggering N8N (mock)
    console.log(`Mock: Would send message to N8N webhook here.`);

    res.status(201).json({
      success: true,
      message:
        "Your message has been received and is being processed by AlliBot (mock).",
      data: userMessage,
    });
  } catch (error) {
    console.error("Mock Error in handleMessage:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Handle N8N replying back with a message
exports.handleN8NReply = async (req, res, next) => {
  try {
    const { message, userId } = req.body;

    if (!message || !userId) {
      return res.status(200).json({
        success: true,
        message: "Missing required fields (mock handler).",
      });
    }

    const botReply = {
      id: mockMessages.length + 1,
      message,
      senderType: "ALLI_BOT",
      userId,
      createdAt: new Date(),
    };

    mockMessages.push(botReply);

    console.log(`Mock: AlliBot replied:`, botReply);

    res.status(200).json({
      success: true,
      message: "Mock AlliBot reply saved.",
      data: botReply,
    });
  } catch (error) {
    console.error("Mock Error in handleN8NReply:", error);
    res.status(200).json({
      success: true,
      message: "Received, but error in mock handler.",
    });
  }
};

// Get conversation history
exports.getConversationHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a userId." });
    }

    const userMessages = mockMessages.filter((msg) => msg.userId === userId);

    res.status(200).json({
      success: true,
      count: userMessages.length,
      data: userMessages,
    });
  } catch (error) {
    console.error("Mock Error in getConversationHistory:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
