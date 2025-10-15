import * as fs from 'fs';
import * as path from 'path';
import { User } from '../entities/user.entity';
import { Gig } from '../entities/gig.entity';
import { Escrow } from '../entities/escrow.entity';
import { Dispute } from '../entities/dispute.entity';
import { Message } from '../entities/message.entity';
import { Notification } from '../entities/notification.entity';

export interface DatabaseData {
    users: User[];
    gigs: Gig[];
    escrows: Escrow[];
    disputes: Dispute[];
    messages: Message[];
    notifications: Notification[];
}

export class JsonStorageUtil {
    private static readonly DATA_FILE = path.join(process.cwd(), 'data.json');

    /**
     * Read all data from the JSON file
     */
    static readData(): DatabaseData {
        try {
            if (!fs.existsSync(this.DATA_FILE)) {
                // Initialize with empty data structure
                const initialData: DatabaseData = {
                    users: [],
                    gigs: [],
                    escrows: [],
                    disputes: [],
                    messages: [],
                    notifications: []
                };
                this.writeData(initialData);
                return initialData;
            }

            const data = fs.readFileSync(this.DATA_FILE, 'utf8');
            return JSON.parse(data) as DatabaseData;
        } catch (error) {
            console.error('Error reading data.json:', error);
            throw new Error('Failed to read data from JSON file');
        }
    }

    /**
     * Write all data to the JSON file
     */
    static writeData(data: DatabaseData): void {
        try {
            fs.writeFileSync(this.DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            console.error('Error writing data.json:', error);
            throw new Error('Failed to write data to JSON file');
        }
    }

    /**
     * Update a specific entity type in the JSON file
     */
    static updateEntity<T extends keyof DatabaseData>(
        entityType: T,
        items: DatabaseData[T]
    ): void {
        const data = this.readData();
        data[entityType] = items;
        this.writeData(data);
    }

    /**
     * Add a new entity to the JSON file
     */
    static addEntity<T extends keyof DatabaseData>(
        entityType: T,
        item: DatabaseData[T][0]
    ): void {
        const data = this.readData();
        (data[entityType] as any[]).push(item);
        this.writeData(data);
    }

    /**
     * Update an existing entity in the JSON file
     */
    static updateEntityById<T extends keyof DatabaseData>(
        entityType: T,
        id: string,
        updates: Partial<DatabaseData[T][0]>
    ): boolean {
        const data = this.readData();
        const items = data[entityType] as any[];
        const index = items.findIndex(item => item.id === id);

        if (index === -1) {
            return false;
        }

        items[index] = { ...items[index], ...updates, updated_at: new Date().toISOString() };
        this.writeData(data);
        return true;
    }

    /**
     * Find an entity by ID
     */
    static findEntityById<T extends keyof DatabaseData>(
        entityType: T,
        id: string
    ): DatabaseData[T][0] | undefined {
        const data = this.readData();
        const items = data[entityType] as any[];
        return items.find(item => item.id === id);
    }

    /**
     * Find entities by a specific field
     */
    static findEntitiesByField<T extends keyof DatabaseData>(
        entityType: T,
        field: string,
        value: any
    ): DatabaseData[T] {
        const data = this.readData();
        const items = data[entityType] as any[];
        return items.filter(item => item[field] === value) as DatabaseData[T];
    }

    /**
     * Delete an entity by ID
     */
    static deleteEntityById<T extends keyof DatabaseData>(
        entityType: T,
        id: string
    ): boolean {
        const data = this.readData();
        const items = data[entityType] as any[];
        const index = items.findIndex(item => item.id === id);

        if (index === -1) {
            return false;
        }

        items.splice(index, 1);
        this.writeData(data);
        return true;
    }

    /**
     * Generate a unique ID
     */
    static generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
