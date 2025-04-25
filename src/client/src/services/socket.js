import { io } from 'socket.io-client';

// Define a URL do servidor backend
// Em desenvolvimento, usamos localhost:3000 (onde o server Node.js está rodando)
// Em produção, isso precisaria ser ajustado para a URL do servidor implantado.
const SERVER_URL = import.meta.env.VITE_API_URL;

// Cria a instância do socket
// autoConnect: false - evita que ele tente conectar imediatamente ao carregar o módulo
const socket = io(SERVER_URL, {
  autoConnect: false
});

// Log de eventos para depuração (opcional, mas útil)
socket.onAny((event, ...args) => {
  console.log(`Socket event received: ${event}`, args);
});

socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

socket.on('connect_error', (err) => {
  console.error('Socket connection error:', err.message);
});

// Exporta a instância do socket para ser usada em outros lugares
export default socket;
