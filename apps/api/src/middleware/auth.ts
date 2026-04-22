import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request type supaya bisa tambah property 'user'
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        tenantId: string;
        role: string;
    };
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as AuthRequest['user'];

        req.user = decoded;
        next(); // lanjut ke handler berikutnya
    } catch (_error) {
        res.status(401).json({ error: `Invalid or expired token: ${_error}` });
    }
};
