export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
    id: string;
    tenantId: string;
    customerId: string;
    staffId: string;
    serviceId: string;
    startTime: Date;
    endTime: Date;
    status: BookingStatus;
    createdAt: Date;
}
