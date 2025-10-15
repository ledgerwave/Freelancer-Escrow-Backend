export enum DisputeStatus {
    OPEN = 'OPEN',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED'
}

export enum DisputeOutcome {
    RELEASE_TO_SELLER = 'RELEASE_TO_SELLER',
    REFUND_TO_BUYER = 'REFUND_TO_BUYER'
}

export class Dispute {
    id: string;
    escrow_id: string;
    status: DisputeStatus;
    arbiter_id?: string;
    resolution?: DisputeOutcome;
    reason: string;
    created_at: string;
    updated_at: string;
}
