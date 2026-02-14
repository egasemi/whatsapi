import pkg from 'whatsapp-web.js'
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { executablePath } from 'puppeteer';

// Crear una instancia del cliente de WhatsApp con autenticación local
const client = new Client({
    puppeteer: { 
        headless: true, 
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath: '/usr/bin/google-chrome'
    },
    authStrategy: new LocalAuth({
        clientId: 'prod',
    },)
});

let readyResolve;
let readyReject;

// “Promise actual” que se recrea cuando reiniciás
let readyPromise = new Promise((res, rej) => {
  readyResolve = res;
  readyReject = rej;
});

// Promesa para manejar cuando el cliente esté listo
let isClientReady = false;

function resetReadyPromise() {
    isClientReady = false;
    readyPromise = new Promise((res, rej) => {
        readyResolve = res;
        readyReject = rej;
    });
}

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true})
})

client.on('ready', () => {
    console.log("✅ WhatsApp listo")
    isClientReady = true;
    readyResolve()
})

client.on('auth_failure', (message) => {
    console.error("❌ auth_failure:", message);
    resetReadyPromise()
})

client.on('disconnected', async (reason) => {
    console.warn("⚠️ disconnected:", reason)
    resetReadyPromise()
    try {
        await client.destroy()
    } catch {}
    client.initialize()
})

client.initialize()

export async function waitForClientReady() {
    await readyPromise;
    if(!isClientReady) throw new Error("Cliento no listo")
}

// Función para enviar un mensaje
export const sendMessage = async (number, message) => {
    await waitForClientReady()  // Espera a que el cliente esté listo antes de enviar el mensaje
    const chatId = `${number}@c.us`;
    console.log(`Mensaje enviado a ${number}`);
    return client.sendMessage(chatId, message);

};

// Función para verificar si un número es cliente de WhatsApp
export const isWhatsAppNumber = async (number) => {
    await waitForClientReady();
    const chatId = `${number}@c.us`;
    return client.isRegisteredUser(chatId);
};

export const formatNumber = async (number) => {
    await waitForClientReady();
    return client.getFormattedNumber(String(number))
}

export const checkStatus = async () => {
    await waitForClientReady();
    return client.getState()
}

export { client };