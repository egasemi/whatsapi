const whatsappService = require('../services/whatsappService');

// Controlador para enviar un mensaje
const sendMessage = async (req, res) => {
    try {
        const { number, message } = req.body;
        await whatsappService.sendMessage(number, message);
        res.status(200).json({ message: 'Mensaje enviado con éxito!' });
    } catch (error) {
        res.status(500).json({ error: 'Error al enviar el mensaje', details: error.message });
    }
};

module.exports = {
    sendMessage,
};
