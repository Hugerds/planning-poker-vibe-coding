<template>
  <div class="home">
    <h1>Welcome to Planning Poker</h1>

    <div v-if="!isConnected">Connecting to server...</div>

    <div v-else class="form-container">
      <h2>Join or Create a Room</h2>
      <input type="text" v-model="playerName" placeholder="Your Name" required />

      <div class="room-action create-room-section">
        <input type="text" v-model="roomName" placeholder="New Room Name" />
        
        <!-- Deck Type Selection -->
        <select v-model="selectedDeckType">
          <option v-for="(deck, key) in DECKS" :key="key" :value="key">
            {{ deck.name }}
          </option>
          <option value="custom">Custom Deck</option>
        </select>

        <div v-if="selectedDeckType === 'custom'" class="custom-deck-input">
          <label for="customDeck">Custom Deck Values (comma-separated):</label>
          <input type="text" id="customDeck" v-model="customDeckInput" placeholder="e.g., 1, 2, 3, 5, ?, coffee">
        </div>

        <label class="setting-label">
          <input type="checkbox" v-model="autoRevealSetting" />
          Auto-reveal
        </label>
        <button @click="createRoom" :disabled="!playerName.trim() || !roomName.trim()">Create Room</button>
      </div>

      <div class="room-action">
        <input type="text" v-model="roomIdToJoin" placeholder="Existing Room ID" />
        <label><input type="checkbox" v-model="joinAsSpectator"> Join as Spectator</label>
        <button @click="joinRoom" :disabled="!playerName.trim() || !roomIdToJoin.trim()">Join Room</button>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import socket from '../services/socket'; // Import the socket instance
import { DECKS } from '../utils/decks'; // Import available decks

const router = useRouter(); // Get router instance
const playerName = ref('');
const roomName = ref('');
const roomIdToJoin = ref('');
const isConnected = ref(socket.connected);
const errorMessage = ref('');
const joinAsSpectator = ref(false); // State for spectator checkbox
const autoRevealSetting = ref(false); // State for auto-reveal setting
const selectedDeckType = ref('fibonacci'); // Add state for selected deck, default to fibonacci
const customDeckInput = ref(''); // Input for custom deck values

// Function to handle room creation
const createRoom = () => {
  if (!playerName.value.trim() || !roomName.value.trim()) return;
  errorMessage.value = ''; // Clear previous error
  let customDeckValues = null;
  if (selectedDeckType.value === 'custom') {
    if (!customDeckInput.value.trim()) {
        errorMessage.value = 'Please enter comma-separated values for the custom deck.';
        return;
    }
    customDeckValues = customDeckInput.value
                         .split(',')
                         .map(val => val.trim())
                         .filter(val => val !== ''); // Remove empty strings
    if (customDeckValues.length === 0) {
        errorMessage.value = 'Custom deck cannot be empty. Please provide valid values.';
        return;
    }
  }

  console.log(`Creating room with name: ${roomName.value}, Deck: ${selectedDeckType.value}, Auto-Reveal: ${autoRevealSetting.value}`);
  socket.emit('create_room', {
    playerName: playerName.value,
    roomName: roomName.value,
    deckType: selectedDeckType.value, // Include selected deck type
    customDeckValues: customDeckValues, // Send custom values if deckType is 'custom'
    settings: { autoReveal: autoRevealSetting.value } // Include settings
  });
};

// Function to handle joining a room
const joinRoom = () => {
  if (!playerName.value.trim() || !roomIdToJoin.value.trim()) return;
  errorMessage.value = ''; // Clear previous error
  console.log(`Attempting to join room: ${roomIdToJoin.value} as ${playerName.value} (Spectator: ${joinAsSpectator.value})`);
  socket.emit('join_room', {
    playerName: playerName.value,
    roomId: roomIdToJoin.value,
    isSpectator: joinAsSpectator.value // Include spectator status
  });
};

// --- Socket Event Listeners ---
const handleConnect = () => {
  console.log('Connected to socket server with ID:', socket.id);
  isConnected.value = true;
};

const handleDisconnect = () => {
  console.log('Disconnected from socket server');
  isConnected.value = false;
  errorMessage.value = 'Disconnected from server.';
};

const handleConnectError = (error) => {
  console.error('Socket connection error:', error);
  isConnected.value = false;
  errorMessage.value = `Connection failed: ${error.message}. Is the backend server running?`;
};

const handleRoomCreated = ({ roomId, playerId, gameState }) => {
  console.log('Room Created:', { roomId, playerId, gameState });
  // Navigate to the room view, passing necessary data
  router.push({ name: 'Room', params: { roomId: roomId } });
};

const handleRoomJoined = ({ roomId, playerId, gameState }) => {
  console.log('Room Joined:', { roomId, playerId, gameState });
  // Navigate to the room view
  router.push({ name: 'Room', params: { roomId: roomId } });
};

const handleError = ({ message }) => {
  console.error('Server Error:', message);
  errorMessage.value = message;
};

// --- Lifecycle Hooks ---
onMounted(() => {
  // Setup listeners before connecting
  socket.on('connect', handleConnect);
  socket.on('disconnect', handleDisconnect);
  socket.on('connect_error', handleConnectError);
  socket.on('room_created', handleRoomCreated);
  socket.on('room_joined', handleRoomJoined);
  socket.on('error', handleError); // Listen for generic errors from backend

  // Attempt to connect if not already connected
  if (!socket.connected) {
    socket.connect();
  }

  // Optional: Check connection status immediately
  isConnected.value = socket.connected;
  if (!isConnected.value) {
      console.log("Attempting to connect socket...")
  }
});

onUnmounted(() => {
  // Clean up listeners when the component is destroyed
  socket.off('connect', handleConnect);
  socket.off('disconnect', handleDisconnect);
  socket.off('connect_error', handleConnectError);
  socket.off('room_created', handleRoomCreated);
  socket.off('room_joined', handleRoomJoined);
  socket.off('error', handleError);

  // Optionally disconnect if leaving the home view means leaving the app context
  // Be careful with this if other parts of the app need the socket
  // socket.disconnect();
});

</script>

<style scoped>
.home {
  padding: 20px;
  max-width: 500px;
  margin: 40px auto;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}
h1 {
  margin-bottom: 30px;
  color: #333;
}
.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
input[type="text"],
select { /* Add select styling */
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
}
.room-action {
  display: flex;
  gap: 10px;
  align-items: center;
}
.room-action input,
.room-action select { /* Make select grow too */
  flex-grow: 1;
}

/* Specific style for create room section for better layout */
.create-room-section {
    flex-wrap: wrap; /* Allow wrapping on smaller screens */
}
.create-room-section input[type="text"] {
    min-width: 150px; /* Ensure name input has decent width */
}
.create-room-section select {
    min-width: 150px; /* Ensure deck select has decent width */
    flex-grow: 0.5; /* Allow less growth than name input */
}
.create-room-section .setting-label {
    flex-basis: 100%; /* Take full width on wrap */
    margin-top: 5px; /* Add space when wrapped */
    font-size: 0.9em;
}

.custom-deck-input {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed #ccc;
}

button {
  padding: 10px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
  white-space: nowrap; /* Prevent button text wrapping */
}
button:hover {
  background-color: #45a049;
}
button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
.error-message {
    margin-top: 15px;
    color: #D8000C; /* Red */
    background-color: #FFD2D2; /* Light red */
    border: 1px solid #D8000C;
    padding: 10px;
    border-radius: 4px;
}
.setting-label {
  display: flex; /* Align checkbox and text */
  align-items: center;
  gap: 5px;
  font-size: 0.9em;
  cursor: pointer;
}
</style>
