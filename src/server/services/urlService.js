// URL Service for generating and managing URLs
const { v4: uuidv4 } = require('uuid');

// In-memory store for URL mappings
const urlMappings = new Map();

/**
 * Generate a unique URL for room invitation via QR code
 * @param {string} roomId - The ID of the room to join
 * @returns {string} - The unique token for the URL
 */
function generateQRCodeInviteUrl(roomId) {
    const token = uuidv4();
    urlMappings.set(token, {
        roomId,
        type: 'qrcode-invite',
        createdAt: new Date(),
        // Definir uma data de expirau00e7u00e3o para o token (24 horas por padru00e3o)
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    return token;
}

/**
 * Validate a URL token and return the associated data
 * @param {string} token - The token to validate
 * @returns {Object|null} - The data associated with the token or null if invalid
 */
function validateUrlToken(token) {
    const data = urlMappings.get(token);
    
    // Verificar se o token existe e nu00e3o expirou
    if (!data) return null;
    
    // Verificar se o token expirou
    if (data.expiresAt && new Date() > data.expiresAt) {
        // Remover tokens expirados
        urlMappings.delete(token);
        return null;
    }
    
    return data;
}

/**
 * Delete a URL token
 * @param {string} token - The token to delete
 * @returns {boolean} - Whether the token was successfully deleted
 */
function deleteUrlToken(token) {
    return urlMappings.delete(token);
}

module.exports = {
    generateQRCodeInviteUrl,
    validateUrlToken,
    deleteUrlToken
};
