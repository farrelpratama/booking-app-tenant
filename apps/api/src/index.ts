import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import type { Tenant } from '@booking-app/types';

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

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Booking API is running' });
});

// Test endpoint pakai shared type
app.get('/test-types', (req, res) => {
    const exampleTenant: Tenant = {
        id: '1',
        name: 'Barbershop Budi',
        slug: 'barbershop-budi',
        createdAt: new Date(),
    };
    res.json(exampleTenant);
});

app.listen(PORT, () => {
    console.log(`API server running on port :${PORT}...`);
});
