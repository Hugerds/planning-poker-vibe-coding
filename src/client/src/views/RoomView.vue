<template>
  <div class="room-view">
    <header class="room-header mb-3">
      <h1>{{ roomName }}</h1>
      <p class="text-secondary">ID: {{ roomId }} | Seu ID: {{ playerId }}</p>
      <div class="header-actions">
        <button @click="toggleQRCodeModal" class="btn btn-primary btn-sm mr-2">Compartilhar via QR Code</button>
        <button @click="leaveRoom" class="btn btn-secondary btn-sm">Sair da Sala</button>
      </div>
    </header>

    <div class="room-layout">
      <!-- Coluna Esquerda (Info e Jogadores) -->
      <aside class="sidebar-section card mb-3">
        <div class="card-body">
          <h3 class="card-title">Jogadores ({{ players.length }})</h3>
          <ul class="player-list">
            <li v-for="player in players" :key="player.id" :class="{ 'current-player': player.id === playerId }">
              <span class="connection-status-dot online" title="Online"></span>
              <span class="player-name">{{ player.name }}</span>
              <span v-if="player.id === moderatorId" class="moderator-badge" title="Moderador">👑</span>
              <span v-if="player.hasVoted && currentRoundStatus === 'voting'" class="voted-badge" title="Votou">🗳️</span> 
              <!-- Usando emoji de urna como alternativa ao amarelo -->
            </li>
          </ul>
        </div>
      </aside>

      <!-- Coluna Direita (Controles, Jogo, Resultados) -->
      <main class="main-content">
        <!-- Controles do Moderador -->
        <section class="moderator-controls card mb-3" v-if="isModerator">
          <div class="card-body">
            <h3 class="card-title">Controles do Moderador</h3>
            <div class="controls-buttons">
              <button @click="startRound" :disabled="currentRoundStatus !== 'waiting'" class="btn btn-primary mr-1">
                Iniciar Rodada
              </button>
              <button @click="revealVotes" :disabled="currentRoundStatus !== 'voting'" class="btn btn-primary mr-1">
                Revelar Votos
              </button>
              <button @click="resetRound" :disabled="currentRoundStatus !== 'revealed'" class="btn btn-secondary">
                Resetar Rodada
              </button>
            </div>
            <p class="mt-2">Status Atual: <strong class="text-primary">{{ currentRoundStatus }}</strong></p>
          </div>
        </section>

        <!-- Área de Jogo/Votação -->
        <section class="game-area card mb-3">
           <div class="card-body">
              <h3 class="card-title">Área de Votação</h3>
              <!-- Cards de Votação -->
              <div class="voting-cards" v-if="currentPlayer && !currentPlayer.isSpectator && currentRoundStatus === 'voting'">
                <h4>Seu Voto:</h4>
                <div class="cards-container">
                  <div
                    v-for="cardValue in votingDeck" 
                    :key="cardValue"
                    class="vote-card"
                    :class="{ 
                      selected: selectedVote === cardValue, 
                      disabled: currentRoundStatus !== 'voting' 
                    }"
                    @click="submitVote(cardValue)"
                  >
                    {{ cardValue }}
                  </div>
                </div>
                <p v-if="selectedVote !== null" class="mt-2 text-success">Voto enviado: {{ selectedVote }}</p>
              </div>
              <div v-else-if="currentRoundStatus === 'waiting'">
                <p class="text-secondary">Aguardando o moderador iniciar a rodada...</p>
              </div>
               <div v-else-if="currentRoundStatus === 'revealed'">
                 <p class="text-secondary">Votos revelados. Veja os resultados abaixo.</p>
              </div>
               <div v-else-if="currentPlayer && currentPlayer.isSpectator">
                 <p class="text-secondary">Você é um espectador nesta rodada.</p>
              </div>
           </div>
        </section>

        <!-- Seção de Resultados -->
        <section v-if="currentRoundStatus === 'revealed'" class="results-section card mb-3">
          <div class="card-body">
            <h3 class="card-title">Resultados da Votação</h3>
            <ul class="results-list">
              <li v-for="player in players.filter(p => !p.isSpectator)" :key="player.id">
                <strong>{{ player.name }}:</strong> 
                <span :class="{'text-secondary': roundVotes[player.id] === undefined}">
                   {{ roundVotes[player.id] !== undefined ? roundVotes[player.id] : 'Não votou' }}
                </span>
              </li>
            </ul>
            <!-- Sumário -->
            <div class="results-summary mt-3" v-if="roundVotes && Object.keys(roundVotes).length > 0">
              <h4>Sumário da Rodada</h4>
              <p><strong>Votos Contabilizados:</strong> {{ Object.keys(roundVotes).length }}</p>
              <p><strong>Média (Numérica):</strong> <span :class="{'text-secondary': getAverageVote() === null}">{{ getAverageVote() !== null ? getAverageVote() : 'N/A' }}</span></p>
              <p><strong>Voto(s) Majoritário(s):</strong> {{ getMajorityVote() || 'Nenhum' }}</p>
              <h5>Distribuição:</h5>
              <ul class="distribution-list">
                <li v-for="(count, vote) in getVoteDistribution()" :key="vote">
                  <span class="vote-value">{{ vote }}:</span> {{ count }} voto(s)
                </li>
              </ul>
            </div>
             <div v-else class="mt-3">
                <p class="text-secondary">Nenhum voto foi registrado nesta rodada.</p>
             </div>
          </div>
        </section>
      </main>
    </div>

    <!-- QR Code Modal -->
    <div v-if="showQRCodeModal" class="modal-overlay" @click.self="toggleQRCodeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Compartilhar Sala</h3>
          <button @click="toggleQRCodeModal" class="close-button">&times;</button>
        </div>
        <div class="modal-body">
          <QRCodeShare :roomId="roomId" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import socket from '../services/socket';
import { getDeckValues } from '../utils/decks';
import { DECKS } from '../utils/decks'; // Import standard decks
import QRCodeShare from '../components/QRCodeShare.vue';

const route = useRoute();
const router = useRouter();

const roomId = ref(route.params.roomId);
const roomName = ref('Loading...');
const playerId = ref(socket.id); // Use current socket ID
const players = ref([]);
const currentDeckType = ref('fibonacci'); // Default, will be updated by game state
const selectedVote = ref(null);
const moderatorId = ref(null); // Add state for moderator ID
const currentRoundStatus = ref('waiting'); // Add state for round status
const roundVotes = ref({}); // Add state for revealed votes
const gameState = ref({}); // Add state for game state

// QR Code modal state
const showQRCodeModal = ref(false);

// Toggle QR Code modal
const toggleQRCodeModal = () => {
  showQRCodeModal.value = !showQRCodeModal.value;
};

// --- Computed Properties ---
const currentDeckCards = computed(() => {
  return getDeckValues(currentDeckType.value);
});

const isModerator = computed(() => {
  // Check if the current player's ID matches the moderator ID received from the state
  return playerId.value === moderatorId.value;
});

const currentPlayer = computed(() => {
  return players.value.find(p => p.id === socket.id);
});

const votingDeck = computed(() => {
  // Check gameState first
  if (!gameState.value) return []; 
  
  // Determine if custom deck is valid
  const isCustomDeckValid = gameState.value.deckType === 'custom' && Array.isArray(gameState.value.customDeckValues) && gameState.value.customDeckValues.length > 0;

  // If it's a custom deck and has values, use them
  if (isCustomDeckValid) {
    return gameState.value.customDeckValues;
  }
  
  // Otherwise, get values from the standard DECKS object using gameState
  const standardDeck = DECKS[gameState.value.deckType]?.values || [];
  return standardDeck;
});

// --- Placeholder Functions ---
const leaveRoom = () => {
  console.log(`Leaving room ${roomId.value}`);
  socket.emit('leave_room', { roomId: roomId.value });
  // Navigate back to Home
  router.push({ name: 'Home' });
};

const handleUpdateGameState = (gameStateUpdate) => {
  console.log('Received updated game state:', gameStateUpdate);
  console.log('gameStateUpdate.players before assignment:', JSON.stringify(gameStateUpdate.players));
  try {
    // Verify the structure and assign
    if (Array.isArray(gameStateUpdate.players)) {
      players.value = gameStateUpdate.players;
      console.log('players.value after assignment:', JSON.stringify(players.value));
    } else {
      console.warn('Received gameStateUpdate.players is not an array:', gameStateUpdate.players);
      players.value = []; // Reset or handle appropriately
    }

    // Update other values
    roomName.value = gameStateUpdate.name || 'Unknown Room';
    currentDeckType.value = gameStateUpdate.deckType || 'fibonacci';
    moderatorId.value = gameStateUpdate.moderatorId; // Update moderator ID
    currentRoundStatus.value = gameStateUpdate.currentRound?.status || 'waiting'; // Update round status
    roundVotes.value = gameStateUpdate.currentRound?.votes || {}; // Update revealed votes
    gameState.value = gameStateUpdate; // Update game state

    // Reset local vote selection if round status changes (e.g., new round, revealed)
    if (currentRoundStatus.value !== 'voting') {
      selectedVote.value = null;
    }
  } catch (error) {
    console.error('Error processing game state update:', error, gameStateUpdate);
  }
};

// --- Voting Function ---
const submitVote = (cardValue) => {
  // Prevent voting if the round is not in the voting state
  if (currentRoundStatus.value !== 'voting') {
    console.log('Cannot vote now. Round status:', currentRoundStatus.value);
    return; 
  }

  console.log(`Voting: ${cardValue} in room ${roomId.value}`);
  selectedVote.value = cardValue;
  socket.emit('submit_vote', { roomId: roomId.value, vote: cardValue });
  // Add visual feedback (e.g., disable cards, show 'voted' status)
};

// --- Moderator Action Functions ---
const startRound = () => {
  if (isModerator.value && currentRoundStatus.value === 'waiting') {
    console.log(`Moderator action: Starting round in room ${roomId.value}`);
    socket.emit('start_round', { roomId: roomId.value });
  }
};

const revealVotes = () => {
  if (isModerator.value && currentRoundStatus.value === 'voting') {
    console.log(`Moderator action: Revealing votes in room ${roomId.value}`);
    socket.emit('reveal_votes', { roomId: roomId.value });
  }
};

const resetRound = () => {
  if (isModerator.value && currentRoundStatus.value === 'revealed') {
    console.log(`Moderator action: Resetting round in room ${roomId.value}`);
    socket.emit('reset_round', { roomId: roomId.value });
  }
};

// --- Helper Functions for Results Summary ---
const getAverageVote = () => {
  const votes = Object.values(roundVotes.value);
  const sum = votes.reduce((acc, vote) => acc + parseInt(vote), 0);
  const average = sum / votes.length;
  return isNaN(average) ? null : average.toFixed(2);
};

const getMajorityVote = () => {
  const votes = Object.values(roundVotes.value);
  const voteCounts = {};
  votes.forEach(vote => {
    voteCounts[vote] = (voteCounts[vote] || 0) + 1;
  });
  const maxCount = Math.max(...Object.values(voteCounts));
  const majorityVotes = Object.keys(voteCounts).filter(vote => voteCounts[vote] === maxCount);
  return majorityVotes.join(', ');
};

const getVoteDistribution = () => {
  const votes = Object.values(roundVotes.value);
  const distribution = {};
  votes.forEach(vote => {
    distribution[vote] = (distribution[vote] || 0) + 1;
  });
  return distribution;
};

// --- Lifecycle Hooks ---
onMounted(() => {
  console.log(`Entered RoomView for room: ${roomId.value}`);
  // Make sure socket is connected
  if (!socket.connected) {
    // Handle case where user lands directly on room page without connection
    // Maybe redirect to Home or try connecting?
    console.warn('Socket not connected upon entering room view.');
    // Attempt connection or redirect
    socket.connect(); // Try connecting
    // Consider adding a check after a delay or redirecting
  }

  // Listen for game state updates
  socket.on('update_game_state', handleUpdateGameState);

  // Request initial game state if needed (optional, depends on backend logic)
  // If the backend doesn't automatically send state on join,
  // we might need to request it here.
  // socket.emit('get_game_state', { roomId: roomId.value });

  // Temporary: Log current players from the join/create event if available
  // This part needs better state management (Vuex/Pinia or prop drilling)
  // For now, we rely on 'update_game_state' event
});

onUnmounted(() => {
  // Clean up room-specific listeners
  socket.off('update_game_state', handleUpdateGameState);

  // Optionally tell the backend the user is leaving the room *view*
  // The actual 'leave_room' logic is handled by the button click
  // but maybe useful for presence status?
  // socket.emit('user_left_view', { roomId: roomId.value });
});

</script>

<style scoped>
.room-view {
  padding: var(--spacing-lg);
}

.room-header {
  text-align: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--spacing-md);
}

.room-header h1 {
  margin-bottom: var(--spacing-xs);
}

.room-layout {
  display: flex;
  flex-direction: column; /* Mobile first: empilhado por padrão */
  gap: var(--spacing-lg);
}

/* Layout para telas maiores */
@media (min-width: 768px) {
  .room-layout {
    flex-direction: row; /* Lado a lado em telas maiores */
  }
  .sidebar-section {
    flex: 0 0 250px; /* Largura fixa para a barra lateral */
  }
  .main-content {
    flex: 1; /* Ocupa o espaço restante */
  }
}

.card {
  /* Estilos de card já definidos globalmente, podemos adicionar específicos se necessário */
  overflow: hidden; /* Garante que cantos arredondados funcionem bem */
}

.card-title {
   margin-bottom: var(--spacing-md);
   color: var(--color-primary); /* Destaca títulos das seções */
}

/* Lista de Jogadores */
.player-list {
  list-style: none;
  padding: 0;
}

.player-list li {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-size-body);
}

.player-list li:last-child {
  border-bottom: none;
}

.player-list .current-player .player-name {
  font-weight: var(--font-weight-semibold);
}

.connection-status-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: var(--spacing-sm);
  background-color: var(--color-text-secondary); /* Cor padrão (offline/desconhecido) */
}

.connection-status-dot.online {
  background-color: var(--color-success);
}

.moderator-badge {
  display: inline-block;
  margin-left: 5px;
}

.voted-badge {
  margin-left: auto; /* Empurra para a direita */
  font-size: var(--font-size-small);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  margin-left: var(--spacing-sm);
}

.voted-badge {
  /* O emoji 🗳️ serve como indicador */
  color: var(--color-primary); /* Cor primária para destaque */
}

/* Controles do Moderador */
.controls-buttons button {
  margin-bottom: var(--spacing-sm); /* Espaçamento inferior em mobile */
}

.controls-buttons .mr-1 {
   margin-right: var(--spacing-sm); /* Espaçamento entre botões em telas maiores */
}

@media (max-width: 767px) {
  .controls-buttons button {
    display: block; /* Botões empilhados em mobile */
    width: 100%;
    margin-right: 0;
  }
}

/* Cards de Votação */
.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.vote-card {
  border: 1px solid var(--color-border);
  background-color: var(--color-secondary);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  min-width: 50px; /* Tamanho mínimo */
  text-align: center;
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: transform 0.1s ease, border-color 0.2s ease, background-color 0.2s ease;
  user-select: none;
}

.vote-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary);
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.vote-card.selected {
  background-color: var(--color-primary);
  color: var(--color-secondary);
  border-color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.vote-card.disabled {
  cursor: not-allowed;
  opacity: 0.6;
  background-color: var(--color-disabled-bg);
  border-color: var(--color-border);
  color: var(--color-text-secondary);
}

.vote-card.disabled:hover {
  transform: none;
  box-shadow: none;
}

/* Seção de Resultados */
.results-list,
.distribution-list {
  list-style: none;
  padding: 0;
}

.results-list li {
  padding: var(--spacing-xs) 0;
}

.results-summary h4 {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  margin-top: var(--spacing-lg);
  margin-bottom: var(--spacing-xs);
}

.results-summary h5 {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  margin-top: var(--spacing-md);
  margin-bottom: var(--spacing-xs);
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.distribution-list li {
  padding: var(--spacing-xs) 0;
  font-size: var(--font-size-small);
}

.distribution-list .vote-value {
  display: inline-block;
  min-width: 30px; /* Alinha os valores */
  font-weight: var(--font-weight-medium);
}

/* Utilitários simples */
.mb-1 { margin-bottom: var(--spacing-sm); }
.mb-2 { margin-bottom: var(--spacing-md); }
.mb-3 { margin-bottom: var(--spacing-lg); }
.mt-1 { margin-top: var(--spacing-sm); }
.mt-2 { margin-top: var(--spacing-md); }
.mt-3 { margin-top: var(--spacing-lg); }
.mr-1 { margin-right: var(--spacing-sm); }
.btn-sm {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-small);
}

/* Header actions */
.header-actions {
  display: flex;
  gap: 10px;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}
</style>
