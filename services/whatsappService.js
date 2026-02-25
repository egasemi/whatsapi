import pkg from 'whatsapp-web.js'
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
console.log("PID:", process.pid);
console.log("WHATS MODULE LOADED", { pid: process.pid, file: import.meta.url, ts: new Date().toISOString() });


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
let reinitInProgress = false;
let reinitTimer = null;

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

client.once('ready', () => {
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
    clearTimeout(reinitTimer)
    reinitTimer = setTimeout(() => {
        console.log('🔄 Re-inicializando cliente...');
        client.initialize();
        reinitInProgress = false;
    }, 5000)

})

client.on('authenticated', () => console.log('🔐 authenticated'));
client.on('change_state', (s) => console.log('🔁 state:', s));
client.on('loading_screen', (pct, msg) => console.log('⏳ loading:', pct, msg));

client.initialize()

export async function waitForClientReady() {
    await readyPromise;
    if(!isClientReady) throw new Error("Cliento no listo")
}

// Función para enviar un mensaje
export const sendMessage = async (number, message) => {
    await waitForClientReady()  // Espera a que el cliente esté listo antes de enviar el mensaje
    console.log(`Mensaje enviado a ${number}`);
    return client.sendMessage(number, message);
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

export const getNumberId = async (number) => {
    await waitForClientReady();
    const raw = String(number).replace(/\D/g, "");
    const numberId = await client.getNumberId(raw)
    if (!numberId) throw new Error("El número no está registrado en WhatsApp");
    return numberId._serialized
}

export { client };