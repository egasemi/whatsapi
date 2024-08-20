import pkg from 'whatsapp-web.js'
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import path from 'path';

// Crear una instancia del cliente de WhatsApp con autenticación local
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'prod',
        dataPath: path.resolve('./sessions'),
    })
});

// Promesa para manejar cuando el cliente esté listo
let isClientReady = false;
const clientReady = new Promise((resolve, reject) => {
    client.on('qr', (qr) => {
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('Cliente de WhatsApp está listo');
        isClientReady = true;
        resolve();
    });

    client.on('auth_failure', (message) => {
        console.error('Error de autenticación', message);
        reject(message);
    });

    client.on('disconnected', (reason) => {
        console.log('Cliente desconectado:', reason);
        isClientReady = false;
        client.initialize();
    });
});

// Inicializa el cliente de WhatsApp
client.initialize();

// Función para enviar un mensaje
export const sendMessage = async (number, message) => {
    await clientReady;  // Espera a que el cliente esté listo antes de enviar el mensaje
    const chatId = `${number}@c.us`;
    await client.sendMessage(chatId, message);
};

// Función para verificar si un número es cliente de WhatsApp
export const isWhatsAppNumber = async (number) => {
    await clientReady;
    const chatId = `${number}@c.us`;
    const isRegistered = await client.isRegisteredUser(chatId);
    return isRegistered;
};

export { clientReady };