const { validateUrlToken } = require('../services/urlService');

/**
 * Handle redirection for QR code invite URLs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function handleQRCodeRedirect(req, res) {
    const token = req.params.token;
    const urlData = validateUrlToken(token);
    
    if (!urlData || urlData.type !== 'qrcode-invite') {
        return res.status(404).send('Invalid or expired invitation link');
    }
    
    // Redirecionar para a página de entrada via QR code com o ID da sala
    // Usando URL absoluta com protocolo correto
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:8080';
    res.redirect(`${protocol}://${host}/#/join/qrcode/${urlData.roomId}?token=${token}`);
}

module.exports = {
    handleQRCodeRedirect
};
