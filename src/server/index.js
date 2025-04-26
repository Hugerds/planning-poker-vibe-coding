const express = require('express');
const http = require('http');
const path = require('path');
const { initializeSocket } = require('./socket');
const { handleQRCodeRedirect } = require('./controllers/urlController');
const runrunController = require('./controllers/runrunController');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON requests
app.use(express.json());

// Servir arquivos estáticos do cliente
const clientPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientPath));

// Basic route for testing server is up
app.get('/', (req, res) => {
  res.send('Servidor Planning Poker está rodando!');
});

// REMOVED: QR Code redirect route - Let the SPA handle this route
// app.get('/invite/:token', handleQRCodeRedirect);

// --- RunRun.it API Routes ---
app.get('/api/runrun/boards', runrunController.handleGetBoards);
app.get('/api/runrun/boards/:boardId/tasks', runrunController.handleGetTasksByBoard);
app.get('/api/runrun/tasks/:taskId/description', runrunController.handleGetTaskDescription);
// -----------------------------

// Rota para lidar com todas as outras requisições e servir o index.html
// para que o Vue Router possa lidar com as rotas no lado do cliente
app.get('*', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

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
