import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tenantRouter from './routes/tenant';
import authRouter from './routes/auth';
import userRouter from './routes/users';

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

// Routes
app.use('/tenants', tenantRouter);
app.use('/auth', authRouter);
app.use('/users', userRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Booking API is running' });
});

app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
});
