import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode-terminal";

let client = null;

let readyResolve, readyReject;
let readyPromise = null;
let isClientReady = false;

let initInProgress = false;
let reinitTimer = null;

function resetReadyPromise() {
  isClientReady = false;
  readyPromise = new Promise((res, rej) => {
    readyResolve = res;
    readyReject = rej;
  });
}

function createClient() {
  const c = new Client({
    authStrategy: new LocalAuth({ clientId: "prod" }),
    webVersionCache: { type: "local" },
    puppeteer: {
      headless: "new",
      protocolTimeout: 120000,              // ✅ ahora sí aplica
      defaultViewport: { width: 1280, height: 720 }, // ✅ ahora sí aplica
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--disable-features=TranslateUI",
      ],
    },
  });

  // Eventos
  c.on("qr", (qr) => qrcode.generate(qr, { small: true }));
  c.on("authenticated", () => console.log("🔐 authenticated"));
  c.on("change_state", (s) => console.log("🔁 state:", s));
  c.on("loading_screen", (pct, msg) => console.log("⏳ loading:", pct, msg));

  // OJO: NO once. Querés que resuelva cada vez que vuelva a estar listo.
  c.on("ready", () => {
    console.log("✅ WhatsApp listo");
    isClientReady = true;
    readyResolve?.();
  });

  c.on("auth_failure", (message) => {
    console.error("❌ auth_failure:", message);
    resetReadyPromise();
  });

  c.on("disconnected", async (reason) => {
    console.warn("⚠️ disconnected:", reason);
    scheduleReinit("disconnected");
  });

  return c;
}

async function initClient() {
  if (initInProgress) return readyPromise;
  initInProgress = true;

  try {
    if (!readyPromise) resetReadyPromise();

    // si había uno viejo, destruilo (best-effort)
    if (client) {
      try { await client.destroy(); } catch {}
      client = null;
    }

    client = createClient();
    await client.initialize();

    return readyPromise;
  } catch (e) {
    readyReject?.(e);
    throw e;
  } finally {
    initInProgress = false;
  }
}

function scheduleReinit(why) {
  resetReadyPromise();
  clearTimeout(reinitTimer);

  reinitTimer = setTimeout(() => {
    console.log(`🔄 Re-inicializando cliente (${why})...`);
    initClient().catch(err => console.error("Reinit failed:", err));
  }, 5000);
}

// Inicializa al cargar el módulo
console.log("PID:", process.pid);
console.log("WHATS MODULE LOADED", { pid: process.pid, file: import.meta.url, ts: new Date().toISOString() });
await initClient();

// API pública
export async function waitForClientReady() {
  await readyPromise;
  if (!isClientReady) throw new Error("Cliente no listo");
}

export async function sendMessage(number, message) {
  await waitForClientReady();

  // ✅ IMPORTANTÍSIMO: resolvé el ID (evita LID missing y otros)
  const raw = String(number).replace(/\D/g, "");
  const numberId = await client.getNumberId(raw);
  if (!numberId) throw new Error("El número no está registrado en WhatsApp");

  console.log(`📨 Enviando a ${numberId._serialized}`);
  return client.sendMessage(numberId._serialized, message);
}

export async function isWhatsAppNumber(number) {
  await waitForClientReady();
  const raw = String(number).replace(/\D/g, "");
  const numberId = await client.getNumberId(raw);
  return Boolean(numberId);
}

export async function formatNumber(number) {
  await waitForClientReady();
  return client.getFormattedNumber(String(number));
}

export async function checkStatus() {
  await waitForClientReady();
  return client.getState();
}

export async function getNumberId(number) {
  await waitForClientReady();
  const raw = String(number).replace(/\D/g, "");
  const numberId = await client.getNumberId(raw);
  if (!numberId) throw new Error("El número no está registrado en WhatsApp");
  return numberId._serialized;
}

export { client };