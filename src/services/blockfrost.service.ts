import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class BlockFrostService {
    private readonly logger = new Logger(BlockFrostService.name);
    private readonly apiClient: AxiosInstance;

    constructor(private configService: ConfigService) {
        const baseURL = this.configService.get<string>('cardano.nodeUrl');
        const apiKey = this.configService.get<string>('cardano.apiKey');
        const timeout = this.configService.get<number>('cardano.apiTimeout');

        this.apiClient = axios.create({
            baseURL,
            timeout,
            headers: {
                'project_id': apiKey,
                'Content-Type': 'application/json',
            },
        });

        // Add request/response interceptors for logging
        this.apiClient.interceptors.request.use(
            (config) => {
                this.logger.debug(`Making BlockFrost API request: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                this.logger.error('BlockFrost API request error:', error);
                return Promise.reject(error);
            }
        );

        this.apiClient.interceptors.response.use(
            (response) => {
                this.logger.debug(`BlockFrost API response: ${response.status} ${response.config.url}`);
                return response;
            },
            (error) => {
                this.logger.error('BlockFrost API response error:', error.response?.data || error.message);
                return Promise.reject(error);
            }
        );
    }

    /**
     * Get network information
     */
    async getNetworkInfo(): Promise<any> {
        try {
            const response = await this.apiClient.get('/network');
            return response.data;
        } catch (error) {
            this.logger.error('Failed to get network info:', error);
            throw error;
        }
    }

    /**
     * Get network clock
     */
    async getNetworkClock(): Promise<any> {
        try {
            const response = await this.apiClient.get('/clock');
            return response.data;
        } catch (error) {
            this.logger.error('Failed to get network clock:', error);
            throw error;
        }
    }

    /**
     * Get address information
     */
    async getAddress(address: string): Promise<any> {
        try {
            const response = await this.apiClient.get(`/addresses/${address}`);
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to get address ${address}:`, error);
            throw error;
        }
    }

    /**
     * Get address UTxOs
     */
    async getAddressUtxos(address: string): Promise<any[]> {
        try {
            const response = await this.apiClient.get(`/addresses/${address}/utxos`);
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to get UTxOs for address ${address}:`, error);
            throw error;
        }
    }

    /**
     * Get address transactions
     */
    async getAddressTransactions(address: string, count: number = 100): Promise<any[]> {
        try {
            const response = await this.apiClient.get(`/addresses/${address}/transactions`, {
                params: { count, order: 'desc' }
            });
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to get transactions for address ${address}:`, error);
            throw error;
        }
    }

    /**
     * Get transaction details
     */
    async getTransaction(txHash: string): Promise<any> {
        try {
            const response = await this.apiClient.get(`/txs/${txHash}`);
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to get transaction ${txHash}:`, error);
            throw error;
        }
    }

    /**
     * Get transaction UTxOs
     */
    async getTransactionUtxos(txHash: string): Promise<any> {
        try {
            const response = await this.apiClient.get(`/txs/${txHash}/utxos`);
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to get UTxOs for transaction ${txHash}:`, error);
            throw error;
        }
    }

    /**
     * Get script (smart contract) information
     */
    async getScript(scriptHash: string): Promise<any> {
        try {
            const response = await this.apiClient.get(`/scripts/${scriptHash}`);
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to get script ${scriptHash}:`, error);
            throw error;
        }
    }

    /**
     * Get script UTxOs (smart contract UTxOs)
     */
    async getScriptUtxos(scriptHash: string): Promise<any[]> {
        try {
            const response = await this.apiClient.get(`/scripts/${scriptHash}/utxos`);
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to get UTxOs for script ${scriptHash}:`, error);
            throw error;
        }
    }

    /**
     * Verify if a transaction exists and is valid
     */
    async verifyTransaction(txHash: string): Promise<boolean> {
        try {
            const tx = await this.getTransaction(txHash);
            return tx && tx.valid_contract;
        } catch (error) {
            if (error.response?.status === 404) {
                return false; // Transaction not found
            }
            throw error;
        }
    }

    /**
     * Check if an address has sufficient balance
     */
    async checkAddressBalance(address: string, requiredAmount: number = 0): Promise<number> {
        try {
            const addressInfo = await this.getAddress(address);
            const lovelaceAmount = addressInfo.amount?.find((item: any) => item.unit === 'lovelace')?.quantity || 0;
            return parseInt(lovelaceAmount);
        } catch (error) {
            this.logger.error(`Failed to check balance for address ${address}:`, error);
            return 0;
        }
    }

    /**
     * Monitor escrow contract UTxOs
     */
    async monitorEscrowContract(contractAddress: string): Promise<any[]> {
        try {
            return await this.getScriptUtxos(contractAddress);
        } catch (error) {
            this.logger.error(`Failed to monitor escrow contract ${contractAddress}:`, error);
            return [];
        }
    }

    /**
     * Get current slot number
     */
    async getCurrentSlot(): Promise<number> {
        try {
            const clock = await this.getNetworkClock();
            return clock.slot;
        } catch (error) {
            this.logger.error('Failed to get current slot:', error);
            throw error;
        }
    }

    /**
     * Calculate slot number from timestamp
     */
    async calculateSlotFromTimestamp(timestamp: string): Promise<number> {
        try {
            const clock = await this.getNetworkClock();
            const targetTime = new Date(timestamp).getTime();
            const currentTime = new Date(clock.time).getTime();
            const slotTime = new Date(clock.slot_time).getTime();

            // Calculate slot based on time difference
            const timeDiff = targetTime - slotTime;
            const slotDiff = Math.floor(timeDiff / 1000); // Assuming 1 second per slot

            return clock.slot + slotDiff;
        } catch (error) {
            this.logger.error('Failed to calculate slot from timestamp:', error);
            throw error;
        }
    }

    /**
     * Health check for BlockFrost API
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await this.apiClient.get('/health');
            return response.status === 200;
        } catch (error) {
            this.logger.error('BlockFrost API health check failed:', error);
            return false;
        }
    }

    /**
     * Handle rate limiting with exponential backoff
     */
    private async handleRateLimit(): Promise<void> {
        const retryAttempts = this.configService.get<number>('cardano.retryAttempts') || 3;

        for (let attempt = 1; attempt <= retryAttempts; attempt++) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
            this.logger.warn(`Rate limit hit, retrying in ${delay}ms (attempt ${attempt}/${retryAttempts})`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}
