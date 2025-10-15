import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Escrow, EscrowState } from '../entities/escrow.entity';
import { JsonStorageUtil } from '../utils/json-storage.util';
import { CreateEscrowDto } from '../dto/create-escrow.dto';
import { DeliverEscrowDto } from '../dto/deliver-escrow.dto';
import { ReleaseEscrowDto } from '../dto/release-escrow.dto';
import { RefundEscrowDto } from '../dto/refund-escrow.dto';
import { NotificationService } from './notification.service';
import { BlockFrostService } from './blockfrost.service';

@Injectable()
export class EscrowService {
    constructor(
        private readonly notificationService: NotificationService,
        private readonly blockFrostService: BlockFrostService
    ) { }

    /**
     * Create a new escrow and prepare metadata for Cardano transaction
     * TODO: Integrate with escrow-contract.plutus to generate lock transaction metadata
     */
    async createEscrow(createEscrowDto: CreateEscrowDto): Promise<Escrow> {
        const { gig_id, buyer_id, amount, expires_at } = createEscrowDto;

        // Validate gig exists
        const gig = JsonStorageUtil.findEntityById('gigs', gig_id);
        if (!gig) {
            throw new NotFoundException('Gig not found');
        }

        // Validate buyer exists
        const buyer = JsonStorageUtil.findEntityById('users', buyer_id);
        if (!buyer) {
            throw new NotFoundException('Buyer not found');
        }

        // Validate expiry date is in the future
        const expiryDate = new Date(expires_at);
        if (expiryDate <= new Date()) {
            throw new BadRequestException('Expiry date must be in the future');
        }

        // Create escrow entity
        const escrow: Escrow = {
            id: JsonStorageUtil.generateId(),
            gig_id,
            buyer_id,
            seller_id: gig.seller_id,
            state: EscrowState.CREATED,
            amount,
            expires_at,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Save to JSON storage
        JsonStorageUtil.addEntity('escrows', escrow);

        // Send notification to seller
        await this.notificationService.sendEmail(
            gig.seller_id,
            'New Escrow Created',
            `A new escrow has been created for your gig "${gig.title}" with amount ${amount} ADA.`
        );

        // Generate Cardano transaction metadata for your escrow-contract.plutus
        const contractAddress = process.env.ESCROW_CONTRACT_ADDRESS || 'addr_test1wrae375x9fq2688cfcraswnr9sgwvnr0aqvqtx77rglg33qrztgve';
        const buyerAddress = createEscrowDto.buyer_id;

        const txMetadata = {
            escrowId: escrow.id,
            amount: amount * 1000000, // Convert ADA to lovelace
            contractAddress: contractAddress,
            buyerAddress: buyerAddress,
            sellerAddress: gig.seller_id,
            expirySlot: this.calculateExpirySlot(expiryDate),
            datum: {
                constructor: 0,
                fields: [
                    { bytes: this.addressToPubKeyHash(buyerAddress) },
                    { bytes: this.addressToPubKeyHash(gig.seller_id) },
                    { bytes: this.addressToPubKeyHash('arbiter_address_here') }, // TODO: Add arbiter
                    { int: this.calculateExpirySlot(expiryDate) },
                    { bytes: Buffer.from(escrow.id).toString('hex') }
                ]
            },
            redeemer: {
                ReleaseToSeller: { constructor: 0, fields: [] },
                RefundToBuyer: { constructor: 1, fields: [] }
            }
        };

        console.log('Cardano transaction metadata for your contract:', txMetadata);
        console.log('Contract Address:', contractAddress);
        console.log('Buyer Address:', buyerAddress);

        return escrow;
    }

    /**
     * Lock escrow when UTxO appears on chain
     * TODO: Verify the transaction hash exists on Cardano blockchain
     */
    async lockEscrow(escrowId: string, txHash: string): Promise<Escrow> {
        const escrow = JsonStorageUtil.findEntityById('escrows', escrowId);
        if (!escrow) {
            throw new NotFoundException('Escrow not found');
        }

        if (escrow.state !== EscrowState.CREATED) {
            throw new BadRequestException('Escrow is not in CREATED state');
        }

        // Verify transaction exists on Cardano blockchain using BlockFrost API
        try {
            const isValid = await this.blockFrostService.verifyTransaction(txHash);
            if (!isValid) {
                throw new BadRequestException('Transaction not found or invalid');
            }

            // Additional verification can be added here:
            // - Check transaction amount matches escrow amount
            // - Verify seller address
            // - Check expiry slot
            console.log(`Transaction ${txHash} verified successfully for escrow: ${escrowId}`);
        } catch (error) {
            console.error(`Failed to verify transaction ${txHash}:`, error);
            throw new BadRequestException('Failed to verify transaction on blockchain');
        }

        // Update escrow state
        const updated = JsonStorageUtil.updateEntityById('escrows', escrowId, {
            state: EscrowState.LOCKED,
            on_chain_tx_hash: txHash
        });

        if (!updated) {
            throw new Error('Failed to update escrow state');
        }

        // Send notifications
        await this.notificationService.sendEmail(
            escrow.buyer_id,
            'Escrow Locked',
            `Your escrow for gig "${escrow.gig_id}" has been locked on the blockchain.`
        );

        await this.notificationService.sendEmail(
            escrow.seller_id,
            'Escrow Locked',
            `The escrow for your gig "${escrow.gig_id}" has been locked. You can now start working.`
        );

        const updatedEscrow = JsonStorageUtil.findEntityById('escrows', escrowId);
        if (!updatedEscrow) {
            throw new Error('Failed to retrieve updated escrow');
        }
        return updatedEscrow;
    }

    /**
     * Mark deliverable as ready
     */
    async deliverEscrow(escrowId: string, deliverDto: DeliverEscrowDto): Promise<Escrow> {
        const escrow = JsonStorageUtil.findEntityById('escrows', escrowId);
        if (!escrow) {
            throw new NotFoundException('Escrow not found');
        }

        if (escrow.state !== EscrowState.LOCKED) {
            throw new BadRequestException('Escrow must be in LOCKED state to deliver');
        }

        // TODO: Store delivery files on IPFS/Arweave
        // For now, we'll just store the hash
        const updated = JsonStorageUtil.updateEntityById('escrows', escrowId, {
            state: EscrowState.DELIVERED,
            delivery_hash: deliverDto.delivery_hash
        });

        if (!updated) {
            throw new Error('Failed to update escrow state');
        }

        // Send notification to buyer
        await this.notificationService.sendEmail(
            escrow.buyer_id,
            'Work Delivered',
            `Your work for escrow "${escrowId}" has been delivered. Please review and release payment.`
        );

        const updatedEscrow = JsonStorageUtil.findEntityById('escrows', escrowId);
        if (!updatedEscrow) {
            throw new Error('Failed to retrieve updated escrow');
        }
        return updatedEscrow;
    }

    /**
     * Release funds to seller
     * TODO: Submit redeem transaction to Cardano blockchain using escrow-contract.plutus
     */
    async releaseToSeller(escrowId: string, releaseDto: ReleaseEscrowDto): Promise<Escrow> {
        const escrow = JsonStorageUtil.findEntityById('escrows', escrowId);
        if (!escrow) {
            throw new NotFoundException('Escrow not found');
        }

        if (escrow.state !== EscrowState.DELIVERED) {
            throw new BadRequestException('Escrow must be in DELIVERED state to release');
        }

        // TODO: Verify signature and submit release transaction to Cardano
        // This should:
        // - Verify the signature belongs to buyer or arbiter
        // - Submit redeem transaction using escrow-contract.plutus
        // - Wait for transaction confirmation
        console.log(`Submitting release transaction for escrow: ${escrowId}`);
        console.log(`Signature: ${releaseDto.signature}`);
        console.log(`Signer: ${releaseDto.signer_id}`);

        const updated = JsonStorageUtil.updateEntityById('escrows', escrowId, {
            state: EscrowState.RELEASED
        });

        if (!updated) {
            throw new Error('Failed to update escrow state');
        }

        // Send notifications
        await this.notificationService.sendEmail(
            escrow.seller_id,
            'Payment Released',
            `Payment for escrow "${escrowId}" has been released to your wallet.`
        );

        await this.notificationService.sendEmail(
            escrow.buyer_id,
            'Payment Released',
            `Payment for escrow "${escrowId}" has been released to the seller.`
        );

        const updatedEscrow = JsonStorageUtil.findEntityById('escrows', escrowId);
        if (!updatedEscrow) {
            throw new Error('Failed to retrieve updated escrow');
        }
        return updatedEscrow;
    }

    /**
     * Refund funds to buyer
     * TODO: Submit refund transaction to Cardano blockchain using escrow-contract.plutus
     */
    async refundToBuyer(escrowId: string, refundDto: RefundEscrowDto): Promise<Escrow> {
        const escrow = JsonStorageUtil.findEntityById('escrows', escrowId);
        if (!escrow) {
            throw new NotFoundException('Escrow not found');
        }

        if (![EscrowState.LOCKED, EscrowState.DELIVERED].includes(escrow.state)) {
            throw new BadRequestException('Escrow must be in LOCKED or DELIVERED state to refund');
        }

        // TODO: Verify signature and submit refund transaction to Cardano
        // This should:
        // - Verify the signature belongs to buyer or arbiter
        // - Submit refund transaction using escrow-contract.plutus
        // - Wait for transaction confirmation
        console.log(`Submitting refund transaction for escrow: ${escrowId}`);
        console.log(`Signature: ${refundDto.signature}`);
        console.log(`Signer: ${refundDto.signer_id}`);
        console.log(`Reason: ${refundDto.reason || 'No reason provided'}`);

        const updated = JsonStorageUtil.updateEntityById('escrows', escrowId, {
            state: EscrowState.REFUNDED
        });

        if (!updated) {
            throw new Error('Failed to update escrow state');
        }

        // Send notifications
        await this.notificationService.sendEmail(
            escrow.buyer_id,
            'Payment Refunded',
            `Payment for escrow "${escrowId}" has been refunded to your wallet.`
        );

        await this.notificationService.sendEmail(
            escrow.seller_id,
            'Payment Refunded',
            `Payment for escrow "${escrowId}" has been refunded to the buyer.`
        );

        const updatedEscrow = JsonStorageUtil.findEntityById('escrows', escrowId);
        if (!updatedEscrow) {
            throw new Error('Failed to retrieve updated escrow');
        }
        return updatedEscrow;
    }

    /**
     * Monitor escrows for timeouts and state changes
     * TODO: Poll Cardano blockchain for transaction confirmations
     */
    async monitorEscrows(): Promise<void> {
        const data = JsonStorageUtil.readData();
        const now = new Date();

        for (const escrow of data.escrows) {
            // Check for expired escrows
            if (escrow.state === EscrowState.LOCKED && new Date(escrow.expires_at) <= now) {
                console.log(`Escrow ${escrow.id} has expired, initiating automatic refund`);

                // TODO: Submit automatic refund transaction
                // This should happen automatically based on the smart contract logic
                await this.refundToBuyer(escrow.id, {
                    signature: 'AUTOMATIC_TIMEOUT', // Special signature for timeout
                    signer_id: 'SYSTEM',
                    reason: 'Escrow expired'
                });
            }

            // TODO: Check blockchain for transaction confirmations
            // This should verify if pending transactions have been confirmed
        }
    }

    /**
     * Get escrow by ID
     */
    async getEscrowById(id: string): Promise<Escrow> {
        const escrow = JsonStorageUtil.findEntityById('escrows', id);
        if (!escrow) {
            throw new NotFoundException('Escrow not found');
        }
        return escrow;
    }

    /**
     * Get all escrows for a user
     */
    async getEscrowsByUserId(userId: string): Promise<Escrow[]> {
        const data = JsonStorageUtil.readData();
        return data.escrows.filter(
            escrow => escrow.buyer_id === userId || escrow.seller_id === userId
        );
    }

    /**
     * Calculate Cardano slot number from date
     * TODO: Implement proper slot calculation based on Cardano network parameters
     */
    private calculateExpirySlot(expiryDate: Date): number {
        // This is a simplified calculation
        // In reality, you need to account for:
        // - Network genesis time
        // - Slot length (1 second on mainnet)
        // - Epoch parameters
        const now = new Date();
        const secondsUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / 1000);
        return Math.floor(Date.now() / 1000) + secondsUntilExpiry;
    }

    /**
     * Convert Cardano address to PubKeyHash (simplified)
     * TODO: Implement proper address decoding
     */
    private addressToPubKeyHash(address: string): string {
        // This is a simplified implementation
        // In reality, you need to decode the bech32 address
        // For now, return a placeholder that matches the expected format
        if (address.startsWith('addr_test1')) {
            // Extract the hex part from the address (simplified)
            return address.slice(11, 43); // This is not correct, just for demonstration
        }
        return 'placeholder_pubkeyhash';
    }
}
