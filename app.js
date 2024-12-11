import express from 'express';
import config from './config/config.js';
import messageRoutes from './routes/messageRoutes.js';
import testRoutes from './routes/testRoutes.js';
import morgan from 'morgan';

const app = express();

// Middleware para parsear JSON
app.use(express.json());
app.use(morgan("tiny"))

// Monta las rutas
app.use('/api/messages', messageRoutes);
app.use('/api/test', testRoutes);

// Inicia el servidor
app.listen(config.port, () => {
    console.log(`Servidor corriendo en el puerto ${config.port}`);
});
