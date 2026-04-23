import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '../middleware/auth';
import {
    resolveTenant,
    enforceTenantAccess,
    TenantRequest,
} from '../middleware/tenant';

const router = Router();
const protect = [authenticate, resolveTenant, enforceTenantAccess];

// GET /services - list semua layanan di tenant ini
router.get('/', ...protect, async (req: TenantRequest, res: Response) => {
    try {
        const tenant = req.tenant || res.locals['tenant'];

        const services = await prisma.service.findMany({
            where: {
                tenantId: tenant.id,
                isActive: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(services);
    } catch (_error) {
        res.status(500).json({ error: `Failed to fetch services: ${_error}` });
    }
});

// POST /services - buat layanan baru
router.post('/', ...protect, async (req: TenantRequest, res: Response) => {
    try {
        const tenant = req.tenant || res.locals['tenant'];
        const { name, description, duration, price, maxCapacity } = req.body;

        if (!name || !duration || !price) {
            res.status(400).json({
                error: 'Name, duration, and price are required',
            });
            return;
        }

        if (typeof duration !== 'number' || duration <= 0) {
            res.status(400).json({
                error: 'Duration must be a positive number in minutes',
            });
            return;
        }

        if (typeof price !== 'number' || price < 0) {
            res.status(400).json({
                error: 'Price must be a non-negative number',
            });
            return;
        }

        const service = await prisma.service.create({
            data: {
                tenantId: tenant.id,
                name,
                description: description || null,
                duration,
                price,
                maxCapacity: maxCapacity || 1,
            },
        });

        res.status(201).json(service);
    } catch (_error) {
        res.status(500).json({ error: `Failed to create service$: ${_error}` });
    }
});
// PATCH /services/:id - update layanan
router.patch('/:id', ...protect, async (req: TenantRequest, res: Response) => {
    try {
        const tenant = req.tenant || res.locals['tenant'];
        const serviceId = req.params['id'] as string;
        const { name, description, duration, price, maxCapacity, isActive } =
            req.body;

        // Cek service ada dan milik tenant ini
        const existing = await prisma.service.findFirst({
            where: { id: serviceId, tenantId: tenant.id },
        });

        if (!existing) {
            res.status(404).json({ error: 'Service not found' });
            return;
        }

        const updated = await prisma.service.update({
            where: { id: serviceId },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(duration !== undefined && { duration }),
                ...(price !== undefined && { price }),
                ...(maxCapacity !== undefined && { maxCapacity }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        res.json(updated);
    } catch (_error) {
        res.status(500).json({ error: `Failed to update service: ${_error}` });
    }
});

// DELETE /services/:id - soft delete (set isActive = false)
router.delete('/:id', ...protect, async (req: TenantRequest, res: Response) => {
    try {
        const tenant = req.tenant || res.locals['tenant'];
        const serviceId = req.params['id'] as string;

        const existing = await prisma.service.findFirst({
            where: { id: serviceId, tenantId: tenant.id },
        });

        if (!existing) {
            res.status(404).json({ error: 'Service not found' });
            return;
        }

        // Soft delete — data tidak benar-benar dihapus
        // History booking yang pakai service ini tetap intact
        await prisma.service.update({
            where: { id: serviceId },
            data: { isActive: false },
        });

        res.json({ message: 'Service deactivated successfully' });
    } catch (_error) {
        res.status(500).json({ error: `Failed to delete service: ${_error}` });
    }
});

export default router;
