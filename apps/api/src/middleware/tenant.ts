import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { prisma } from '../prisma';

export interface TenantRequest extends AuthRequest {
    tenant?: {
        id: string;
        name: string;
        slug: string;
    };
}

export const resolveTenant = async (
    req: TenantRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const tenantSlug =
            (req.headers as Record<string, string>)['x-tenant-slug'] ||
            req.subdomains[0];

        if (!tenantSlug) {
            res.status(400).json({ error: 'Tenant not specified' });
            return;
        }

        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
            select: { id: true, name: true, slug: true },
        });

        if (!tenant) {
            res.status(404).json({ error: 'Tenant not found' });
            return;
        }

        // Pakai res.locals sebagai alternatif yang lebih reliable
        res.locals['tenant'] = tenant;
        req.tenant = tenant;
        next();
    } catch (_error) {
        res.status(500).json({ error: `Failed to resolve tenant: ${_error}` });
    }
};

export const enforceTenantAccess = (
    req: TenantRequest,
    res: Response,
    next: NextFunction
) => {
    // Baca dari res.locals sebagai fallback
    const tenant = req.tenant || res.locals['tenant'];
    const user = req.user;

    if (!user || !tenant) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    if (user.tenantId !== tenant.id) {
        res.status(403).json({ error: 'Access denied to this tenant' });
        return;
    }

    // Pastikan req.tenant terisi untuk handler berikutnya
    req.tenant = tenant;
    next();
};
