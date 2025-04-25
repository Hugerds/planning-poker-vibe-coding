/**
 * QR Code Service
 * Provides utilities for generating and rendering QR codes
 */

// Using qrcode.js library for QR code generation
import QRCode from 'qrcode';

/**
 * Generate a QR code as a data URL
 * @param {string} text - The text to encode in the QR code
 * @param {Object} options - Options for the QR code generator
 * @returns {Promise<string>} - A promise that resolves to the QR code data URL
 */
export async function generateQRCode(text, options = {}) {
  const defaultOptions = {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 200,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  };

  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    return await QRCode.toDataURL(text, mergedOptions);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

/**
 * Render a QR code to a canvas element
 * @param {string} text - The text to encode in the QR code
 * @param {HTMLCanvasElement} canvas - The canvas element to render to
 * @param {Object} options - Options for the QR code generator
 * @returns {Promise<void>}
 */
export async function renderQRCodeToCanvas(text, canvas, options = {}) {
  const defaultOptions = {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 200,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  };

  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    await QRCode.toCanvas(canvas, text, mergedOptions);
  } catch (error) {
    console.error('Error rendering QR code to canvas:', error);
    throw error;
  }
}

/**
 * Download a QR code as an image
 * @param {string} dataUrl - The QR code data URL
 * @param {string} filename - The filename for the downloaded image
 */
export function downloadQRCode(dataUrl, filename = 'qrcode.png') {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default {
  generateQRCode,
  renderQRCodeToCanvas,
  downloadQRCode
};
