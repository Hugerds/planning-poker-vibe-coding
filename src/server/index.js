const express = require('express');
const http = require('http');
const { initializeSocket } = require('./socket');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

const PORT = process.env.PORT || 3000;

// Basic route for testing server is up
app.get('/', (req, res) => {
  res.send('Servidor Planning Poker está rodando!');
});

// Middleware could be added here if needed (e.g., express.json() for REST APIs later)

server.listen(PORT, () => {
  console.log(`Servidor escutando na porta ${PORT}`);
});

// Handle graceful shutdown (optional but good practice)
process.on('SIGTERM', () => {
  console.info('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
    // Close Socket.IO connections if needed, or DB connections later
     io.close(() => {
         console.log('Socket.IO closed');
         process.exit(0); 
     });
  })
});
