const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const { errorHandler } = require('./middleware/error');
const { setupFolders } = require('./utils/setup');
const { logger } = require('./utils/logger');
const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const estimateRoutes = require('./routes/estimateRoutes');
const contactRoutes = require('./routes/contactRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Load environment variables
dotenv.config();

// Setup required folders
setupFolders();

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Set up middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/estimates', estimateRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/ai', aiRoutes);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use(errorHandler);

// WebSocket Server
const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
  logger.info('Client connected to WebSocket');

    const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 15000); // Send a ping every 15 seconds

  ws.on('message', message => {
    logger.info(`Received message: ${message}`);
    // You can broadcast the message to all connected clients
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(`Broadcast: ${message}`);
      }
    });
  });

  ws.on('close', () => {
    logger.info('Client disconnected');
  });

  ws.on('error', err => logger.error('WebSocket error:', err));
});

// Function to send message to all connected clients
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Expose broadcast function to be used in other modules
module.exports = { broadcast };

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
});
