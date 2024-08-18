import { sendMessage as sendWhatsAppMessage, isWhatsAppNumber } from '../services/whatsappService.js';

// Controlador para enviar un mensaje
export const sendMessage = async (req, res) => {
    try {
        const { number, message } = req.body;
        await sendWhatsAppMessage(number, message);
        res.status(200).json({ message: 'Mensaje enviado con éxito!' });
    } catch (error) {
        res.status(500).json({ error: 'Error al enviar el mensaje', details: error.message });
    }
};

// Controlador para verificar si un número es cliente de WhatsApp
export const checkWhatsAppNumber = async (req, res) => {
    try {
        const { number } = req.params;
        const isRegistered = await isWhatsAppNumber(number);
        res.status(200).json({ isRegistered });
    } catch (error) {
        res.status(500).json({ error: 'Error al verificar el número', details: error.message });
    }
};
