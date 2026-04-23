import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '../middleware/auth';
import {
    resolveTenant,
    enforceTenantAccess,
    TenantRequest,
} from '../middleware/tenant';

const router = Router();

// Semua route di sini butuh: auth + tenant resolved + tenant match
const protect = [authenticate, resolveTenant, enforceTenantAccess];

// GET /users - list semua user di tenant ini
router.get('/', ...protect, async (req: TenantRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            where: { tenantId: req.tenant!.id }, // selalu filter by tenant
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(users);
    } catch (_error) {
        res.status(500).json({ error: `Failed to fetch users: ${_error}` });
    }
});

// GET /users/:id - detail user (harus di tenant yang sama)
router.get('/', ...protect, async (req: TenantRequest, res: Response) => {
    try {
        const tenant = req.tenant || res.locals['tenant'];

        const users = await prisma.user.findMany({
            where: { tenantId: tenant.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(users);
    } catch (_error) {
        res.status(500).json({ error: `Failed to fetch users ${_error}` });
    }
});

export default router;
