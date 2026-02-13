import { sendMessage as sendWhatsAppMessage, isWhatsAppNumber, formatNumber } from '../services/whatsappService.js';

// Controlador para enviar un mensaje
export const sendMessage = async (req, res) => {
    try {
        const { number, message } = req.body;
        const isRegistered = await isWhatsAppNumber(number)

        if(!isRegistered) {
            return res.status(400).json({error: "El número no tiene whatsapp", message: "sin whatsapp"})
        }

/*         const formatedNumber = await formatNumber(number)
        if(!formatedNumber.startsWith("+54 9 ")) {
            return res.status(400).json({error: "El número es de otro país", message: "número mal escrito"})
        } */
        await sendWhatsAppMessage(number, message);
        res.status(200).json({ message: 'mensaje enviado' });
    } catch (error) {
        console.error(`⚠️ Error en controlador: ${error.message}`);
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
