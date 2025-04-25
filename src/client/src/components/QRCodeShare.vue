<template>
  <div class="qrcode-share">
    <div v-if="loading" class="loading">
      <p>Gerando QR code...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="generateQRCodeForRoom" class="retry-button">Tentar Novamente</button>
    </div>
    
    <div v-else class="qrcode-container">
      <div class="qrcode-image">
        <img :src="qrCodeDataUrl" alt="QR Code" />
      </div>
      
      <div class="qrcode-info">
        <p>Escaneie este QR code para entrar diretamente na sala</p>
        <p class="link-info">Link de convite: <span class="invite-link">{{ inviteUrl }}</span></p>
        <div class="qrcode-actions">
          <button @click="copyInviteLink" class="action-button">
            <span>{{ copySuccess ? 'Copiado!' : 'Copiar Link' }}</span>
          </button>
          <button @click="downloadQRCodeImage" class="action-button">
            <span>Baixar QR Code</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import socket from '../services/socket';
import { generateQRCode as createQRCode, downloadQRCode } from '../services/qrcode';

const props = defineProps({
  roomId: {
    type: String,
    required: true
  }
});

// State variables
const qrCodeDataUrl = ref('');
const inviteUrl = ref('');
const loading = ref(false);
const error = ref('');
const copySuccess = ref(false);

// Generate QR code
const generateQRCodeForRoom = async () => {
  loading.value = true;
  error.value = '';
  
  // Request QR code URL from server
  socket.emit('generate_qrcode', { roomId: props.roomId });
};

// Copy invite link to clipboard
const copyInviteLink = async () => {
  try {
    await navigator.clipboard.writeText(inviteUrl.value);
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
    error.value = 'Erro ao copiar o link';
  }
};

// Download QR code as image
const downloadQRCodeImage = () => {
  downloadQRCode(qrCodeDataUrl.value, `planning-poker-sala-${props.roomId}.png`);
};

// Socket event handlers
const handleQRCodeGenerated = async ({ inviteUrl: url }) => {
  try {
    inviteUrl.value = url;
    qrCodeDataUrl.value = await createQRCode(url, { width: 256 });
    loading.value = false;
  } catch (err) {
    console.error('Error generating QR code:', err);
    error.value = 'Falha ao gerar o QR code';
    loading.value = false;
  }
};

// Setup socket event listeners
onMounted(() => {
  socket.on('qrcode_generated', handleQRCodeGenerated);
  
  // Generate QR code on mount
  generateQRCodeForRoom();
  
  // Clean up on unmount
  return () => {
    socket.off('qrcode_generated', handleQRCodeGenerated);
  };
});
</script>

<style scoped>
.qrcode-share {
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading, .error {
  text-align: center;
  padding: 20px 0;
}

.retry-button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #f1f1f1;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qrcode-image {
  margin-bottom: 16px;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.qrcode-image img {
  display: block;
  max-width: 100%;
  height: auto;
}

.qrcode-info {
  text-align: center;
  width: 100%;
}

.qrcode-info p {
  margin-bottom: 16px;
  color: #555;
}

.link-info {
  font-size: 0.9rem;
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  word-break: break-all;
  margin: 10px 0;
}

.invite-link {
  font-weight: 500;
  color: #333;
}

.qrcode-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}

.action-button {
  padding: 8px 16px;
  background-color: #f1f1f1;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.action-button:hover {
  background-color: #e0e0e0;
}
</style>
