// src/client/src/composables/useSocket.js
import { ref } from 'vue';
import { io } from 'socket.io-client';

// Estado reativo para a instância do socket e o status da conexão
const socket = ref(null);
const isConnected = ref(false);

// URL do servidor Socket.IO (ajuste se necessário)
const SERVER_URL = import.meta.env.VITE_API_URL;

/**
 * Estabelece a conexão com o servidor Socket.IO.
 * Garante que apenas uma conexão seja ativa por vez.
 */
const connectSocket = () => {
  // Se já estiver conectado ou tentando conectar, não faz nada
  if (socket.value?.connected || socket.value?.connecting) {
    console.log('Socket already connected or connecting.');
    return;
  }

  console.log(`Attempting to connect to Socket.IO server at ${SERVER_URL}...`);
  // Cria uma nova instância do socket
  socket.value = io(SERVER_URL, {
    // Opções de conexão (opcional)
    // transports: ['websocket'], // Forçar websocket se necessário
    // autoConnect: false // Controlar conexão manualmente se precisar
  });

  // Listeners básicos de conexão
  socket.value.on('connect', () => {
    console.log('Socket connected successfully! ID:', socket.value.id);
    isConnected.value = true;
  });

  socket.value.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    isConnected.value = false;
    // Opcional: tentar reconectar ou limpar estado
    // socket.value = null; // Descartar instância antiga se não reconectar automaticamente
  });

  socket.value.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    isConnected.value = false;
    // Limpar socket se o erro for grave e não houver reconexão automática
    // socket.value?.disconnect();
    // socket.value = null;
  });

  // Opcional: Conectar explicitamente se autoConnect for false
  // socket.value.connect();
};

/**
 * Desconecta o socket do servidor.
 */
const disconnectSocket = () => {
  if (socket.value?.connected) {
    console.log('Disconnecting socket...');
    socket.value.disconnect();
  }
  socket.value = null; // Limpa a referência
  isConnected.value = false;
};

/**
 * Exporta a instância reativa do socket e as funções de controle.
 * Isso permite que qualquer componente Vue use o mesmo socket.
 */
export function useSocket() {
  return {
    socket,
    isConnected,
    connectSocket,
    disconnectSocket,
  };
}
