import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tenantRouter from './routes/tenant';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    })
);

app.use(express.json());

// routes
app.use('/tenants', tenantRouter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Booking API is running' });
});

app.listen(PORT, () => {
    console.log(`API server running on port :${PORT}...`);
});
