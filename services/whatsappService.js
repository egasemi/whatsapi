import pkg from 'whatsapp-web.js'
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import path from 'path';

// Crear una instancia del cliente de WhatsApp con autenticación local
const client = new Client({
    puppeteer: { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] },
    authStrategy: new LocalAuth({
        clientId: 'prod',
        dataPath: path.resolve('./sessions'),
    },)
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

    client.on('message_ack', async (msg, ack) => {
        // Solo actuar cuando el mensaje fue entregado
        if (ack === 2 && msg.fromMe) {
            try {
                const phoneNumber = msg.to.replace('@c.us', '');
                
                // Buscar el ID dentro del mensaje con formato *#234#*
                const match = msg.body.match(/\*#(\d+)#\*/);
                const messageId = match ? match[1] : null;

                if (messageId) {
                    console.log(`📩 Mensaje entregado a ${phoneNumber} con ID ${messageId}`);

                    // Llamada HTTP a tu URL
                    await fetch('https://script.google.com/macros/s/AKfycbwkgPaWklu-xJk7akXyh8Ja8LxvND6_6RA9QblyrpPSS5iHvZWX3TDjDbKp_BcH4UHMtg/exec?fn=editarUltimaCoincidencia', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: parseInt(messageId)
                        })
                    });
                }
            } catch (error) {
                console.error('⚠️ Error al notificar entrega de mensaje:', error.message);
            }
        }
    })
});

// Inicializa el cliente de WhatsApp
client.initialize();

// Función para enviar un mensaje
export const sendMessage = async (number, message) => {
    await clientReady;  // Espera a que el cliente esté listo antes de enviar el mensaje
    const chatId = `${number}@c.us`;
    if (!isClientReady) {
        throw new Error('El cliente de WhatsApp no está listo');
    }
    try {
        await client.sendMessage(chatId, message);
        console.log(`Mensaje enviado a ${number}`);
    } catch (err) {
        console.warn(`Error interno al enviar mensaje a ${number}: ${err.message}`);
        // No lanzamos el error para evitar romper la API si el mensaje fue enviado igual
    }
};

// Función para verificar si un número es cliente de WhatsApp
export const isWhatsAppNumber = async (number) => {
    await clientReady;
    const chatId = `${number}@c.us`;
    const isRegistered = await client.isRegisteredUser(chatId);
    return isRegistered;
};

export const formatNumber = async (number) => {
    await clientReady;
    const formatedNumber = await client.getFormattedNumber(String(number))
    return formatedNumber
}

export const checkStatus = async () => {
    await clientReady;
    const clientStatus = await client.getState()
    return clientStatus
}

export { clientReady };