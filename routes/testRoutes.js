import { Router } from 'express';
import { sendTestStatus } from '../controllers/testController.js';

const router = Router();

// Ruta para verificar si un número es cliente de WhatsApp
router.get('/', sendTestStatus);

export default router;
