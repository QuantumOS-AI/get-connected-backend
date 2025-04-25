const fs = require('fs');
const path = require('path');

// Create necessary directories
const setupFolders = () => {
  const logsDir = path.join(__dirname, '../../logs');
  
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
};

module.exports = { setupFolders };
