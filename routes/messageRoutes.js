const express = require('express');
const messageController = require('../controllers/messageController');

const router = express.Router();

// Ruta para enviar un mensaje
router.post('/send', messageController.sendMessage);

module.exports = router;
