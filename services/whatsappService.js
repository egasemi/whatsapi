const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client();

// Inicializa el cliente de WhatsApp
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Cliente de WhatsApp está listo');
});

// Maneja la autenticación y reconexión
client.initialize();

// Función para enviar un mensaje
const sendMessage = async (number, message) => {
    const chatId = `${number}@c.us`; // Formato para números de WhatsApp
    await client.sendMessage(chatId, message);
};

module.exports = {
    sendMessage,
};
