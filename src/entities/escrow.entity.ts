export enum EscrowState {
    CREATED = 'CREATED',
    LOCKED = 'LOCKED',
    DELIVERED = 'DELIVERED',
    RELEASED = 'RELEASED',
    REFUNDED = 'REFUNDED',
    CLOSED = 'CLOSED'
}

export class Escrow {
    id: string;
    gig_id: string;
    buyer_id: string;
    seller_id: string;
    state: EscrowState;
    amount: number; // in ADA
    expires_at: string;
    on_chain_tx_hash?: string;
    delivery_hash?: string;
    created_at: string;
    updated_at: string;
}
