import express from 'express';
import cors from 'cors';
import path from 'path';
import verifyEmail from './src/verifyEmail.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

app.post('/api/verify', async (req, res) => {
    try {
        const { email } = req.body;
        const result = await verifyEmail(email);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            email: req.body.email || '',
            result: 'unknown',
            resultcode: 3,
            subresult: 'server_error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Email Verifier running on http://localhost:${PORT}`);
});
