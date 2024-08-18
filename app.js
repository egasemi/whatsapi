const express = require('express');
const config = require('./config/config');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Monta las rutas
app.use('/api/messages', messageRoutes);

// Inicia el servidor
app.listen(config.port, () => {
    console.log(`Servidor corriendo en el puerto ${config.port}`);
});
