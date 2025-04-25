<template>
  <div class="qrcode-join-container">
    <div class="join-card">
      <h1>Entrar na Sala de Planning Poker</h1>
      
      <div v-if="loading" class="loading">
        <p>Carregando informações da sala...</p>
      </div>
      
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="goToHome">Ir para a Página Inicial</button>
      </div>
      
      <div v-else class="join-form">
        <p v-if="roomName" class="room-info">Sala: <strong>{{ roomName }}</strong></p>
        
        <div class="form-group">
          <label for="playerName">Seu Nome:</label>
          <input 
            type="text" 
            id="playerName" 
            v-model="playerName" 
            placeholder="Digite seu nome" 
            autofocus
            required
          />
        </div>
        
        <div class="actions">
          <button 
            @click="joinRoom" 
            :disabled="!playerName.trim() || !roomId || joining"
            class="join-button"
          >
            {{ joining ? 'Entrando...' : 'Entrar na Sala' }}
          </button>
          
          <button @click="goToHome" class="secondary-button">
            Cancelar
          </button>
        </div>
        
        <p v-if="joinError" class="error-message">{{ joinError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import socket from '../services/socket';

const router = useRouter();
const route = useRoute();

// State variables
const playerName = ref('');
const roomName = ref('');
const loading = ref(true);
const error = ref('');
const joinError = ref('');
const joining = ref(false);

// Get room ID from route params or resolve it from token
const roomId = ref(route.params.roomId); 
const token = route.params.token || route.query.token;

// Se temos apenas o token, precisamos obter o roomId e roomName do servidor
const fetchRoomDetailsFromToken = async () => {
  if (!roomId.value && token) {
    console.log('Obtendo detalhes da sala a partir do token:', token);
    loading.value = true;
    error.value = '';
    socket.emit('get_room_id_from_token', { token });
  } else if (roomId.value) {
    console.warn('QRCodeJoinView acessado com roomId, mas sem buscar detalhes via token inicialmente.');
    loading.value = false; 
  } else {
    error.value = 'Informações inválidas para entrar na sala.';
    loading.value = false;
  }
};

// Function to join the room
const joinRoom = () => {
  if (!playerName.value.trim() || !roomId.value) return;
  
  joining.value = true;
  joinError.value = '';
  
  socket.emit('join_room_via_qrcode', {
    playerName: playerName.value,
    roomId: roomId.value,
    token: token 
  });
};

// Function to go to home page
const goToHome = () => {
  router.push('/');
};

// Socket event handlers

const handleRoomJoinedViaQRCode = ({ roomId: joinedRoomId, playerId, gameState }) => {
  if (joinedRoomId === roomId.value && !gameState?.error) { 
    joining.value = false;
    router.push({ name: 'Room', params: { roomId: joinedRoomId } });
  } else if (gameState?.error) {
    console.error('Erro ao entrar na sala (via QR):', gameState.error);
    joinError.value = gameState.error || 'Falha ao entrar na sala.';
    joining.value = false;
  } else if (joinedRoomId !== roomId.value) {
    console.warn(`Recebido evento room_joined para sala ${joinedRoomId}, mas esperado ${roomId.value}`);
  }
};

const handleError = ({ message }) => {
  console.error('Server Error:', message);
  if (joining.value) {
    joinError.value = message || 'Falha ao entrar na sala';
    joining.value = false;
  } else {
    error.value = message || 'Ocorreu um erro no servidor';
    loading.value = false; 
  }
};

// Handler para receber o roomId e roomName a partir do token
const handleRoomIdFromToken = ({ roomId: resolvedRoomId, roomName: resolvedRoomName, error: tokenError }) => {
  if (tokenError) {
    error.value = tokenError || 'Token inválido ou expirado';
    loading.value = false;
    return;
  }
  
  if (resolvedRoomId && resolvedRoomName) {
    roomId.value = resolvedRoomId;
    roomName.value = resolvedRoomName; 
    console.log(`Detalhes obtidos do token: RoomId=${resolvedRoomId}, RoomName=${resolvedRoomName}`);
    loading.value = false;
  } else {
    error.value = 'Não foi possível obter os detalhes da sala a partir do token';
    loading.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  socket.on('connect', fetchRoomDetailsFromToken); 
  socket.on('error', handleError);
  socket.on('room_joined', handleRoomJoinedViaQRCode); 
  socket.on('room_id_from_token', handleRoomIdFromToken); 
  
  if (!socket.connected) {
    console.log('Socket não conectado, conectando...');
    socket.connect();
  } else {
    console.log('Socket já conectado, buscando detalhes da sala...');
    fetchRoomDetailsFromToken(); 
  }
});

onUnmounted(() => {
  socket.off('connect', fetchRoomDetailsFromToken);
  socket.off('error', handleError);
  socket.off('room_joined', handleRoomJoinedViaQRCode);
  socket.off('room_id_from_token', handleRoomIdFromToken);
});
</script>

<style scoped>
.qrcode-join-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.join-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 450px;
}

h1 {
  margin-top: 0;
  margin-bottom: 24px;
  color: #333;
  text-align: center;
  font-size: 1.8rem;
}

.loading, .error {
  text-align: center;
  padding: 20px 0;
}

.room-info {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

button {
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.join-button {
  background-color: #4caf50;
  color: white;
  flex: 2;
}

.join-button:hover {
  background-color: #45a049;
}

.join-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.secondary-button {
  background-color: #f1f1f1;
  color: #333;
  flex: 1;
}

.secondary-button:hover {
  background-color: #e0e0e0;
}

.error-message {
  color: #d32f2f;
  margin-top: 16px;
  text-align: center;
}
</style>
