import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

const router = Router();

// GET /tenant - Get all tenants

router.get('/', async (req: Request, res: Response) => {
    try {
        const tenants = await prisma.tenant.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(tenants);
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch tenants: ${error}` });
    }
});

// POST /tenants - buat tenant baru
router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, slug } = req.body;

        if (!name || !slug) {
            res.status(400).json({ error: 'Name and slug are required' });
            return;
        }

        const cleanSlug = slug.toLowerCase().replace(/\s+/g, '-');

        const tenant = await prisma.tenant.create({
            data: { name, slug: cleanSlug },
        });

        res.status(201).json(tenant);
    } catch (error: unknown) {
        console.error('POST /tenants error:', error); // ← tambah ini
        if (
            error instanceof Error &&
            error.message.includes('Unique constraint')
        ) {
            res.status(409).json({ error: 'Slug already taken' });
            return;
        }
        res.status(500).json({ error: 'Failed to create tenant' });
    }
});

// GET /tenants/:slug
router.get('/:slug', async (req: Request, res: Response) => {
    try {
        const slug = req.params['slug'] as string; // ← cast ke string

        const tenant = await prisma.tenant.findUnique({
            where: { slug },
        });

        if (!tenant) {
            res.status(404).json({ error: 'Tenant not found' });
            return;
        }

        res.json(tenant);
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch tenant: ${error}` });
    }
});

export default router;
