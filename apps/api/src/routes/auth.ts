import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { name, email, password, tenantSlug } = req.body;

        if (!name || !email || !password || !tenantSlug) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });

        if (!tenant) {
            res.status(404).json({ error: 'Tenant not found' });
            return;
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email_tenantId: { email, tenantId: tenant.id },
            },
        });

        if (existingUser) {
            res.status(409).json({ error: 'Email already registered' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                tenantId: tenant.id,
                role: 'CUSTOMER',
            },
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _password, ...userWithoutPassword } = user;

        res.status(201).json({
            message: 'User registered successfully',
            user: userWithoutPassword,
        });
    } catch (_error) {
        res.status(500).json({ error: `Failed to register user: ${_error}` });
    }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password, tenantSlug } = req.body;

        if (!email || !password || !tenantSlug) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });

        if (!tenant) {
            res.status(404).json({ error: 'Tenant not found' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: {
                email_tenantId: { email, tenantId: tenant.id },
            },
        });

        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET is not defined');

        const token = jwt.sign(
            {
                userId: user.id,
                tenantId: user.tenantId,
                role: user.role,
            },
            secret,
            { expiresIn: '7d' }
        );

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _password, ...userWithoutPassword } = user;

        res.json({
            message: 'Login successful',
            token,
            user: userWithoutPassword,
        });
    } catch (_error) {
        res.status(500).json({ error: `Failed to login ${_error}` });
    }
});

// GET /auth/me - test protected route
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            select: {
                id: true,
                name: true,
                email: true,
                tenantId: true,
                createdAt: true,
            },
        });

        if (!user) {
            res.status(404).json({ error: 'User not found!' });
            return;
        }

        res.json(user);
    } catch (_error) {
        res.status(500).json({ error: `Failed to fetch: ${_error}` });
    }
});

export default router;
