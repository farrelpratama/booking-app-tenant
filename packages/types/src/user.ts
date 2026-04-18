export type UserRole = 'owner' | 'admin' | 'staff' | 'customer';

export interface User {
    id: string;
    tenantId: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Date;
}
