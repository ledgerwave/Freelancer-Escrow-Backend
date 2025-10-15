export class Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    attachments?: string[]; // IPFS links
    created_at: string;
    updated_at: string;
}
