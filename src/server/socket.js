const { Server } = require('socket.io');
const roomController = require('./controllers/roomController');

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*", // Allow all origins for now (adjust for production)
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`Usuário conectado: ${socket.id}`);

        // Room Management
        socket.on('create_room', (data) => roomController.handleCreateRoom(socket, io, data));
        socket.on('join_room', (data) => roomController.handleJoinRoom(socket, io, data));
        socket.on('leave_room', (data) => roomController.handleLeaveRoom(socket, io, data));

        // QR Code functionality
        socket.on('generate_qrcode', (data) => roomController.handleGenerateQRCode(socket, io, data));
        socket.on('join_room_via_qrcode', (data) => roomController.handleJoinRoomViaQRCode(socket, io, data));
        socket.on('get_room_id_from_token', (data) => roomController.handleGetRoomIdFromToken(socket, io, data));

        // Game Actions
        socket.on('submit_vote', (data) => roomController.handleSubmitVote(socket, io, data));
        socket.on('reveal_votes', (data) => roomController.handleRevealVotes(socket, io, data));
        socket.on('start_round', (data) => roomController.handleStartRound(socket, io, data));
        socket.on('reset_round', (data) => roomController.handleResetRound(socket, io, data));

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`Disconnect event for ${socket.id}`);
            roomController.handleDisconnect(socket, io); // Call the controller function
        });

        // Generic Error Handling (Optional)
        socket.on('error', (error) => {
            console.error(`Socket Error from ${socket.id}:`, error);
            // Inform client maybe?
            socket.emit('server_error', { message: 'Ocorreu um erro no servidor.' });
        });
    });

    console.log('Socket.IO inicializado.');
    return io;
}

module.exports = { initializeSocket };
