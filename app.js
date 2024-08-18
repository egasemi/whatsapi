import express from 'express';
import config from './config/config.js';
import messageRoutes from './routes/messageRoutes.js';

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Monta las rutas
app.use('/api/messages', messageRoutes);

// Inicia el servidor
app.listen(config.port, () => {
    console.log(`Servidor corriendo en el puerto ${config.port}`);
});
