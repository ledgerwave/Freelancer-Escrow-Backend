import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    HttpStatus,
    HttpCode
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody
} from '@nestjs/swagger';
import { EscrowService } from '../services/escrow.service';
import { CreateEscrowDto } from '../dto/create-escrow.dto';
import { DeliverEscrowDto } from '../dto/deliver-escrow.dto';
import { ReleaseEscrowDto } from '../dto/release-escrow.dto';
import { RefundEscrowDto } from '../dto/refund-escrow.dto';

@ApiTags('Escrows')
@Controller('escrows')
export class EscrowController {
    constructor(private readonly escrowService: EscrowService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new escrow' })
    @ApiBody({ type: CreateEscrowDto })
    @ApiResponse({
        status: 201,
        description: 'Escrow created successfully',
        schema: {
            example: {
                id: '1640995200000-abc123def',
                gig_id: '1640995200000-gig456',
                buyer_id: '1640995200000-user789',
                seller_id: '1640995200000-user123',
                state: 'CREATED',
                amount: 100,
                expires_at: '2024-02-15T10:30:00.000Z',
                created_at: '2024-01-15T10:30:00.000Z',
                updated_at: '2024-01-15T10:30:00.000Z'
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - invalid input data'
    })
    @ApiResponse({
        status: 404,
        description: 'Gig or buyer not found'
    })
    async createEscrow(@Body() createEscrowDto: CreateEscrowDto) {
        return await this.escrowService.createEscrow(createEscrowDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get escrow by ID' })
    @ApiParam({ name: 'id', description: 'Escrow ID' })
    @ApiResponse({
        status: 200,
        description: 'Escrow found',
        schema: {
            example: {
                id: '1640995200000-abc123def',
                gig_id: '1640995200000-gig456',
                buyer_id: '1640995200000-user789',
                seller_id: '1640995200000-user123',
                state: 'LOCKED',
                amount: 100,
                expires_at: '2024-02-15T10:30:00.000Z',
                on_chain_tx_hash: '0x1234567890abcdef...',
                created_at: '2024-01-15T10:30:00.000Z',
                updated_at: '2024-01-15T10:35:00.000Z'
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Escrow not found'
    })
    async getEscrow(@Param('id') id: string) {
        return await this.escrowService.getEscrowById(id);
    }

    @Post(':id/lock')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Lock escrow with transaction hash' })
    @ApiParam({ name: 'id', description: 'Escrow ID' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                tx_hash: {
                    type: 'string',
                    description: 'Cardano transaction hash',
                    example: '0x1234567890abcdef...'
                }
            },
            required: ['tx_hash']
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Escrow locked successfully'
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - invalid state or transaction'
    })
    @ApiResponse({
        status: 404,
        description: 'Escrow not found'
    })
    async lockEscrow(
        @Param('id') id: string,
        @Body('tx_hash') txHash: string
    ) {
        return await this.escrowService.lockEscrow(id, txHash);
    }

    @Post(':id/deliver')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Mark work as delivered' })
    @ApiParam({ name: 'id', description: 'Escrow ID' })
    @ApiBody({ type: DeliverEscrowDto })
    @ApiResponse({
        status: 200,
        description: 'Work marked as delivered'
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - escrow not in LOCKED state'
    })
    @ApiResponse({
        status: 404,
        description: 'Escrow not found'
    })
    async deliverEscrow(
        @Param('id') id: string,
        @Body() deliverDto: DeliverEscrowDto
    ) {
        return await this.escrowService.deliverEscrow(id, deliverDto);
    }

    @Post(':id/release')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Release funds to seller' })
    @ApiParam({ name: 'id', description: 'Escrow ID' })
    @ApiBody({ type: ReleaseEscrowDto })
    @ApiResponse({
        status: 200,
        description: 'Funds released to seller'
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - invalid state or signature'
    })
    @ApiResponse({
        status: 404,
        description: 'Escrow not found'
    })
    async releaseToSeller(
        @Param('id') id: string,
        @Body() releaseDto: ReleaseEscrowDto
    ) {
        return await this.escrowService.releaseToSeller(id, releaseDto);
    }

    @Post(':id/refund')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refund funds to buyer' })
    @ApiParam({ name: 'id', description: 'Escrow ID' })
    @ApiBody({ type: RefundEscrowDto })
    @ApiResponse({
        status: 200,
        description: 'Funds refunded to buyer'
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - invalid state or signature'
    })
    @ApiResponse({
        status: 404,
        description: 'Escrow not found'
    })
    async refundToBuyer(
        @Param('id') id: string,
        @Body() refundDto: RefundEscrowDto
    ) {
        return await this.escrowService.refundToBuyer(id, refundDto);
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get all escrows for a user' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiResponse({
        status: 200,
        description: 'User escrows retrieved',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    gig_id: { type: 'string' },
                    buyer_id: { type: 'string' },
                    seller_id: { type: 'string' },
                    state: { type: 'string' },
                    amount: { type: 'number' },
                    expires_at: { type: 'string' },
                    created_at: { type: 'string' },
                    updated_at: { type: 'string' }
                }
            }
        }
    })
    async getUserEscrows(@Param('userId') userId: string) {
        return await this.escrowService.getEscrowsByUserId(userId);
    }

    @Post('monitor')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Monitor escrows for timeouts and state changes' })
    @ApiResponse({
        status: 200,
        description: 'Monitoring completed'
    })
    async monitorEscrows() {
        await this.escrowService.monitorEscrows();
        return { message: 'Escrow monitoring completed' };
    }
}
