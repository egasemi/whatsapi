import { Router } from 'express';
import { sendMessage, checkWhatsAppNumber } from '../controllers/messageController.js';

const router = Router();

// Ruta para enviar un mensaje
router.post('/send', sendMessage);

// Ruta para verificar si un número es cliente de WhatsApp
router.get('/check/:number', checkWhatsAppNumber);

export default router;
