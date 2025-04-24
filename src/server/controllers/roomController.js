const { v4: uuidv4 } = require('uuid');
const Game = require('../models/Game');
const Player = require('../models/Player');

// In-memory store for active rooms
const rooms = new Map(); // Map<roomId, Game>

function handleCreateRoom(socket, io, data) {
    console.log('handleCreateRoom received data:', data);
    const { roomName, playerName, deckType = 'fibonacci', customDeckValues = null, settings = {} } = data;
    const roomId = uuidv4();
    const playerId = socket.id; // Use socket ID as player ID for simplicity
    const moderator = new Player(playerId, playerName || `Moderador_${roomId.substring(0, 4)}`);
    moderator.isModerator = true; // Mark as moderator
    const game = new Game(roomId, roomName, moderator.id, deckType, customDeckValues, settings);
    game.addPlayer(moderator);

    rooms.set(roomId, game);

    socket.join(roomId);
    socket.roomId = roomId; // Store room ID on socket for later use (e.g., disconnect)
    socket.playerId = playerId;

    console.log(`Sala ${roomId} criada por ${playerName || 'Anon'}`);
    socket.emit('room_created', { roomId, playerId: moderator.id, gameState: game.getSerializableState() });

    // Send the initial game state to everyone in the room (including the creator)
    io.to(roomId).emit('update_game_state', game.getSerializableState());
}

function handleJoinRoom(socket, io, data) {
    console.log('handleJoinRoom received data:', data); // Log incoming data
    const { playerName, roomId, isSpectator = false } = data; // Destructure with default for isSpectator
    const game = rooms.get(roomId);

    if (!game) {
        socket.emit('error_joining', { message: 'Sala não encontrada.' });
        console.log(`Tentativa de entrar na sala ${roomId} falhou: Sala não existe.`);
        return;
    }

    const playerId = socket.id;
    // Check if player already exists (e.g., reconnection attempt with same socket id? unlikely here but good practice)
    let player = game.players.find(p => p.id === playerId);
    if (!player) {
        const newPlayer = new Player(playerId, playerName, isSpectator);
        game.addPlayer(newPlayer);
    } else {
        player.isConnected = true; // Mark as connected if rejoining
        player.name = playerName || player.name; // Update name if provided
    }

    socket.join(roomId);
    socket.roomId = roomId;
    socket.playerId = playerId;

    console.log(`${playerName || 'Jogador'} entrou na sala ${roomId}`);
    // Notify others in the room
    socket.to(roomId).emit('player_joined', { player });
    // Send current game state to the joining player
    socket.emit('room_joined', { roomId, playerId, gameState: game.getSerializableState() });

    // Send the updated game state to everyone already in the room
    io.to(roomId).emit('update_game_state', game.getSerializableState());
}

function handleDisconnect(socket, io) {
    const disconnectedSocketId = socket.id;
    let playerFound = false;

    console.log(`Disconnect event for socket ID: ${disconnectedSocketId}`);

    // Iterate through all rooms to find the player associated with the disconnected socket
    for (const [roomId, game] of rooms.entries()) {
        const playerIndex = game.players.findIndex(p => p.id === disconnectedSocketId);

        if (playerIndex !== -1) {
            const player = game.players[playerIndex];
            const playerId = player.id; // We found the player ID
            playerFound = true;

            console.log(`${player.name} (${playerId}) disconnected from room ${roomId}`);

            // Remove the player from the game
            game.removePlayer(playerId);
            console.log(`Player ${playerId} removed. Players remaining: ${game.players.length}/${game.players.length + 1}`); // Log before potential promotion changes count

            let newModeratorId = null;
            // Check if the disconnecting player was the moderator
            if (game.moderatorId === playerId) {
                 console.log(`Moderator ${player.name} left. Attempting to promote new moderator.`);
                // Attempt to promote the next available player
                 const promoted = game.promoteNewModerator(); // promoteNewModerator handles finding the next suitable player
                 if (promoted) {
                     newModeratorId = game.moderatorId;
                     const newModerator = game.getPlayer(newModeratorId);
                     console.log(`Promoted new moderator: ${newModerator.name} (${newModeratorId}) in game ${roomId}`);
                 } else {
                     console.log(`Could not promote a new moderator in game ${roomId}. No suitable players found.`);
                 }
            }

            // If the room is now empty, delete it
            if (game.players.length === 0) {
                console.log(`Room ${roomId} is empty after ${player.name} left. Deleting room.`);
                rooms.delete(roomId);
                // No need to broadcast updates if the room is gone
            } else {
                // Broadcast the updated state to remaining players
                 console.log(`Broadcasting updated state for room ${roomId} after ${player.name} left.`);
                io.to(roomId).emit('player_left', { playerId: playerId, newModeratorId: newModeratorId });
                io.to(roomId).emit('update_game_state', game.getSerializableState());
            }

            // Since we found the player and handled the room, we can stop searching
            break;
        }
    }

    if (!playerFound) {
        console.log(`Socket ${disconnectedSocketId} disconnected but was not found in any active room.`);
    }
    
    // Ensure the socket leaves all underlying Socket.IO rooms it might have been in
    // This is good practice, although less critical if the room was deleted.
    socket.rooms.forEach(room => {
        if(room !== socket.id) { // Don't leave the default room associated with the socket ID itself
             socket.leave(room);
             console.log(`Socket ${disconnectedSocketId} explicitly left Socket.IO room ${room}`);
        }
    });
}

function handleStartRound(socket, io, data) {
    const { roomId } = data;
    const game = rooms.get(roomId);
    const playerId = socket.id;

    if (game && game.moderatorId === playerId && game.currentRound.status === 'waiting') {
        console.log(`Moderador ${playerId} iniciou nova rodada na sala ${roomId}`);
        game.startNewRound();
        io.to(roomId).emit('update_game_state', game.getSerializableState());
    } else if (game) {
        console.log(`Tentativa inválida de iniciar rodada por ${playerId} (não é moderador)`);
        socket.emit('action_error', { message: 'Only the moderator can start a new round when status is waiting.' });
    } else {
         console.log(`Erro ao iniciar rodada: Sala ${roomId} não encontrada.`);
         socket.emit('action_error', { message: 'Room not found.' });
    }
}

function handleResetRound(socket, io, data) {
    const { roomId } = data;
    const game = rooms.get(roomId);
    const playerId = socket.playerId; // Get player ID associated with the socket

    if (game && game.moderatorId === playerId) {
        console.log(`Moderador ${playerId} resetou a rodada na sala ${roomId}`);
        // Resetting is the same as starting a new round in current logic
        game.startNewRound(); 
        io.to(roomId).emit('update_game_state', game.getSerializableState());
    } else if (game) {
        console.log(`Tentativa inválida de resetar rodada por ${playerId} (não é moderador)`);
        socket.emit('action_error', { message: 'Only the moderator can reset the round.' });
    } else {
         console.log(`Erro ao resetar rodada: Sala ${roomId} não encontrada.`);
         socket.emit('action_error', { message: 'Room not found.' });
    }
}

function handleSubmitVote(socket, io, data) {
    // Log for debugging incoming data structure
    console.log('handleSubmitVote received data:', data);

    const { roomId, vote } = data;
    const game = rooms.get(roomId);
    if (game) {
        const player = game.getPlayer(socket.id);
        if (player && !player.isSpectator && game.currentRound.status === 'voting') {
            const success = game.submitVote(socket.id, vote);

            if (success) {
                console.log(`${player.name} votou ${vote} na sala ${roomId}`);
                // Notify everyone (or just moderator) that a player has voted
                io.to(roomId).emit('player_voted', { playerId: socket.id });
                io.to(roomId).emit('update_game_state', game.getSerializableState()); // Send updated state with vote status
                
                // Auto-reveal if setting is enabled and all voted
                if (game.settings.autoReveal && game.allPlayersVoted()) {
                    handleRevealVotes(socket, io, { roomId }, true); // Pass flag to indicate auto-reveal
                }
            } else {
                socket.emit('error', { message: 'Não foi possível registrar o voto (rodada não ativa ou espectador?).' });
            }
        }
    } else {
        socket.emit('error', { message: 'Sala não encontrada.' });
    }
}

function handleRevealVotes(socket, io, { roomId }, autoRevealed = false) {
    const game = rooms.get(roomId);
    // Allow reveal if manually triggered by moderator OR if auto-revealed
    if (game && (game.moderatorId === socket.playerId || autoRevealed)) { 
        const success = game.revealVotes();
        if (success) {
            console.log(`Votos revelados na sala ${roomId}`);
            io.to(roomId).emit('votes_revealed', { votes: game.currentRound.votes, gameState: game });
            io.to(roomId).emit('update_game_state', game.getSerializableState());
        } else {
            // Maybe the round wasn't in 'voting' state
            if(!autoRevealed) socket.emit('error', { message: 'Não foi possível revelar os votos (rodada não estava em votação?).' });
        }
    } else if (game) {
        if(!autoRevealed) socket.emit('error', { message: 'Apenas o moderador pode revelar os votos.' });
    } else {
        if(!autoRevealed) socket.emit('error', { message: 'Sala não encontrada.' });
    }
}

function handleLeaveRoom(socket, io, data) {
    const { roomId } = data; // Get roomId from the data sent by the client
    const playerId = socket.playerId; // Get playerId stored on the socket

    console.log(`handleLeaveRoom: Player ${playerId} attempting to leave room ${roomId}`);

    if (!roomId || !playerId) {
        console.log('handleLeaveRoom: Room ID or Player ID missing.');
        // Optionally send an error back to the client
        socket.emit('leave_error', { message: 'Could not process leave request.' });
        return; 
    }

    const game = rooms.get(roomId); 
    if (!game) {
        console.log(`handleLeaveRoom: Game room ${roomId} not found.`);
         // Room might already be gone, just ensure socket leaves
        socket.leave(roomId);
        console.log(`Socket ${socket.id} left Socket.IO room ${roomId} (game not found).`);
        return; 
    }

    const leavingPlayer = game.getPlayer(playerId);
    const playerName = leavingPlayer ? leavingPlayer.name : playerId;

    console.log(`Player ${playerName} (${playerId}) is leaving room ${roomId}.`);

    const wasModerator = game.moderatorId === playerId;

    // Remove the player from the game model
    game.removePlayer(playerId);
    console.log(`Player ${playerId} removed. Players remaining: ${game.players.length}/${game.players.length + 1}`); // Log before potential promotion changes count

    let newModeratorId = null;
    // Check if the disconnecting player was the moderator
    if (wasModerator) {
        console.log(`Moderator ${playerName} left. Attempting to promote new moderator.`);
        const promoted = game.promoteNewModerator(playerId); 
        if (!promoted && game.players.length > 0) {
            // Fallback
             const firstPlayer = game.players.find(p => !p.isSpectator) || game.players[0];
             if(firstPlayer) {
                game.moderatorId = firstPlayer.id;
                console.log(`Fallback: Assigned moderator to ${firstPlayer.name} (${game.moderatorId})`);
             } else {
                 game.moderatorId = null;
                 console.log(`Fallback: No suitable players left to moderate room ${roomId}.`);
             }
        }
    }

    // If players remain, update everyone. Otherwise, delete the room.
    if (game.players.length > 0) {
        console.log(`Broadcasting updated state for room ${roomId} after ${playerName} left.`);
        io.to(roomId).emit('update_game_state', game.getSerializableState());
    } else {
        console.log(`Room ${roomId} is empty after ${playerName} left. Deleting room.`);
        rooms.delete(roomId); // Clean up empty room
    }

    // Make the socket leave the Socket.IO room
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left Socket.IO room ${roomId}.`);
    // Optional: Clear socket properties if needed, though disconnect will handle this too
    // socket.roomId = null;
    // socket.playerId = null;
}

module.exports = {
    handleCreateRoom,
    handleJoinRoom,
    handleDisconnect,
    handleStartRound,
    handleResetRound,
    handleSubmitVote, 
    handleRevealVotes,
    handleLeaveRoom
};
