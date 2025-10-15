import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Dispute, DisputeStatus, DisputeOutcome } from '../entities/dispute.entity';
import { Escrow, EscrowState } from '../entities/escrow.entity';
import { JsonStorageUtil } from '../utils/json-storage.util';
import { CreateDisputeDto } from '../dto/create-dispute.dto';
import { ResolveDisputeDto } from '../dto/resolve-dispute.dto';
import { EscrowService } from './escrow.service';
import { NotificationService } from './notification.service';

@Injectable()
export class DisputeService {
    constructor(
        private readonly escrowService: EscrowService,
        private readonly notificationService: NotificationService
    ) { }

    /**
     * Open a new dispute for an escrow
     */
    async openDispute(createDisputeDto: CreateDisputeDto): Promise<Dispute> {
        const { escrow_id, reason, complainant_id } = createDisputeDto;

        // Validate escrow exists
        const escrow = await this.escrowService.getEscrowById(escrow_id);

        // Validate complainant is either buyer or seller
        if (complainant_id !== escrow.buyer_id && complainant_id !== escrow.seller_id) {
            throw new BadRequestException('Only buyer or seller can open a dispute');
        }

        // Validate escrow is in a state where disputes are allowed
        if (![EscrowState.LOCKED, EscrowState.DELIVERED].includes(escrow.state)) {
            throw new BadRequestException('Disputes can only be opened for LOCKED or DELIVERED escrows');
        }

        // Check if dispute already exists
        const existingDisputes = JsonStorageUtil.findEntitiesByField('disputes', 'escrow_id', escrow_id);
        if (existingDisputes.length > 0) {
            throw new BadRequestException('A dispute already exists for this escrow');
        }

        // Create dispute entity
        const dispute: Dispute = {
            id: JsonStorageUtil.generateId(),
            escrow_id,
            status: DisputeStatus.OPEN,
            reason,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Save to JSON storage
        JsonStorageUtil.addEntity('disputes', dispute);

        // Send notifications to all parties
        await this.notificationService.sendEmail(
            escrow.buyer_id,
            'Dispute Opened',
            `A dispute has been opened for escrow "${escrow_id}". Reason: ${reason}`
        );

        await this.notificationService.sendEmail(
            escrow.seller_id,
            'Dispute Opened',
            `A dispute has been opened for escrow "${escrow_id}". Reason: ${reason}`
        );

        // TODO: Notify arbiters about the new dispute
        // This should:
        // - Find available arbiters
        // - Send notification to arbiters
        // - Assign an arbiter if available
        console.log(`Dispute opened for escrow ${escrow_id}, notifying arbiters`);

        return dispute;
    }

    /**
     * Resolve a dispute with arbiter decision
     * TODO: Integrate with escrow-contract.plutus for arbiter-controlled transactions
     */
    async resolveDispute(disputeId: string, resolveDto: ResolveDisputeDto): Promise<Dispute> {
        const dispute = JsonStorageUtil.findEntityById('disputes', disputeId);
        if (!dispute) {
            throw new NotFoundException('Dispute not found');
        }

        if (dispute.status !== DisputeStatus.OPEN) {
            throw new BadRequestException('Dispute is not open');
        }

        // Validate arbiter
        // TODO: Implement proper arbiter validation
        // This should check:
        // - Arbiter is authorized to resolve disputes
        // - Arbiter signature is valid
        // - Arbiter is not conflicted with this escrow
        console.log(`Validating arbiter ${resolveDto.arbiter_id} for dispute ${disputeId}`);
        console.log(`Arbiter signature: ${resolveDto.signature}`);

        // Get the escrow
        const escrow = await this.escrowService.getEscrowById(dispute.escrow_id);

        // Update dispute with resolution
        const updated = JsonStorageUtil.updateEntityById('disputes', disputeId, {
            status: DisputeStatus.RESOLVED,
            arbiter_id: resolveDto.arbiter_id,
            resolution: resolveDto.outcome
        });

        if (!updated) {
            throw new Error('Failed to update dispute');
        }

        // Execute the resolution
        if (resolveDto.outcome === DisputeOutcome.RELEASE_TO_SELLER) {
            await this.escrowService.releaseToSeller(escrow.id, {
                signature: resolveDto.signature,
                signer_id: resolveDto.arbiter_id
            });
        } else if (resolveDto.outcome === DisputeOutcome.REFUND_TO_BUYER) {
            await this.escrowService.refundToBuyer(escrow.id, {
                signature: resolveDto.signature,
                signer_id: resolveDto.arbiter_id,
                reason: `Dispute resolved: ${dispute.reason}`
            });
        }

        // Send notifications
        await this.notificationService.sendEmail(
            escrow.buyer_id,
            'Dispute Resolved',
            `Dispute for escrow "${escrow.id}" has been resolved. Outcome: ${resolveDto.outcome}`
        );

        await this.notificationService.sendEmail(
            escrow.seller_id,
            'Dispute Resolved',
            `Dispute for escrow "${escrow.id}" has been resolved. Outcome: ${resolveDto.outcome}`
        );

        const updatedDispute = JsonStorageUtil.findEntityById('disputes', disputeId);
        if (!updatedDispute) {
            throw new Error('Failed to retrieve updated dispute');
        }
        return updatedDispute;
    }

    /**
     * Get dispute by ID
     */
    async getDisputeById(id: string): Promise<Dispute> {
        const dispute = JsonStorageUtil.findEntityById('disputes', id);
        if (!dispute) {
            throw new NotFoundException('Dispute not found');
        }
        return dispute;
    }

    /**
     * Get all disputes for an escrow
     */
    async getDisputesByEscrowId(escrowId: string): Promise<Dispute[]> {
        return JsonStorageUtil.findEntitiesByField('disputes', 'escrow_id', escrowId);
    }

    /**
     * Get all open disputes (for arbiters)
     */
    async getOpenDisputes(): Promise<Dispute[]> {
        const data = JsonStorageUtil.readData();
        return data.disputes.filter(dispute => dispute.status === DisputeStatus.OPEN);
    }

    /**
     * Close a dispute (mark as completed)
     */
    async closeDispute(disputeId: string): Promise<Dispute> {
        const dispute = JsonStorageUtil.findEntityById('disputes', disputeId);
        if (!dispute) {
            throw new NotFoundException('Dispute not found');
        }

        if (dispute.status !== DisputeStatus.RESOLVED) {
            throw new BadRequestException('Only resolved disputes can be closed');
        }

        const updated = JsonStorageUtil.updateEntityById('disputes', disputeId, {
            status: DisputeStatus.CLOSED
        });

        if (!updated) {
            throw new Error('Failed to close dispute');
        }

        const updatedDispute = JsonStorageUtil.findEntityById('disputes', disputeId);
        if (!updatedDispute) {
            throw new Error('Failed to retrieve updated dispute');
        }
        return updatedDispute;
    }
}
