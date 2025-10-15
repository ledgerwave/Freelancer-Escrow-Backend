export enum NotificationType {
    ESCROW_CREATED = 'ESCROW_CREATED',
    ESCROW_LOCKED = 'ESCROW_LOCKED',
    ESCROW_DELIVERED = 'ESCROW_DELIVERED',
    ESCROW_RELEASED = 'ESCROW_RELEASED',
    ESCROW_REFUNDED = 'ESCROW_REFUNDED',
    DISPUTE_OPENED = 'DISPUTE_OPENED',
    DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',
    MESSAGE_RECEIVED = 'MESSAGE_RECEIVED'
}

export class Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    read: boolean;
    content: string;
    created_at: string;
}
