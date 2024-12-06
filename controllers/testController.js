import { checkStatus } from '../services/whatsappService.js';

export const sendTestStatus = async (req, res) => {
    try {
        const status = await checkStatus()
        res.status(200).json({ message: 'server working', status });
    } catch (error) {
        res.status(500).json({ error: 'server error', details: error.message })
    }
}