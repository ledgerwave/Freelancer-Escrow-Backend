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
import { DisputeService } from '../services/dispute.service';
import { CreateDisputeDto } from '../dto/create-dispute.dto';
import { ResolveDisputeDto } from '../dto/resolve-dispute.dto';

@ApiTags('Disputes')
@Controller('disputes')
export class DisputeController {
    constructor(private readonly disputeService: DisputeService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Open a new dispute' })
    @ApiBody({ type: CreateDisputeDto })
    @ApiResponse({
        status: 201,
        description: 'Dispute opened successfully',
        schema: {
            example: {
                id: '1640995200000-dispute123',
                escrow_id: '1640995200000-escrow456',
                status: 'OPEN',
                reason: 'Work delivered does not match requirements',
                created_at: '2024-01-15T10:30:00.000Z',
                updated_at: '2024-01-15T10:30:00.000Z'
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - invalid escrow state or user'
    })
    @ApiResponse({
        status: 404,
        description: 'Escrow not found'
    })
    async openDispute(@Body() createDisputeDto: CreateDisputeDto) {
        return await this.disputeService.openDispute(createDisputeDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get dispute by ID' })
    @ApiParam({ name: 'id', description: 'Dispute ID' })
    @ApiResponse({
        status: 200,
        description: 'Dispute found',
        schema: {
            example: {
                id: '1640995200000-dispute123',
                escrow_id: '1640995200000-escrow456',
                status: 'RESOLVED',
                arbiter_id: '1640995200000-arbiter789',
                resolution: 'RELEASE_TO_SELLER',
                reason: 'Work delivered does not match requirements',
                created_at: '2024-01-15T10:30:00.000Z',
                updated_at: '2024-01-15T11:30:00.000Z'
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Dispute not found'
    })
    async getDispute(@Param('id') id: string) {
        return await this.disputeService.getDisputeById(id);
    }

    @Post(':id/resolve')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Resolve a dispute with arbiter decision' })
    @ApiParam({ name: 'id', description: 'Dispute ID' })
    @ApiBody({ type: ResolveDisputeDto })
    @ApiResponse({
        status: 200,
        description: 'Dispute resolved successfully'
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - dispute not open or invalid arbiter'
    })
    @ApiResponse({
        status: 404,
        description: 'Dispute not found'
    })
    async resolveDispute(
        @Param('id') id: string,
        @Body() resolveDto: ResolveDisputeDto
    ) {
        return await this.disputeService.resolveDispute(id, resolveDto);
    }

    @Get('escrow/:escrowId')
    @ApiOperation({ summary: 'Get all disputes for an escrow' })
    @ApiParam({ name: 'escrowId', description: 'Escrow ID' })
    @ApiResponse({
        status: 200,
        description: 'Disputes retrieved',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    escrow_id: { type: 'string' },
                    status: { type: 'string' },
                    reason: { type: 'string' },
                    created_at: { type: 'string' },
                    updated_at: { type: 'string' }
                }
            }
        }
    })
    async getEscrowDisputes(@Param('escrowId') escrowId: string) {
        return await this.disputeService.getDisputesByEscrowId(escrowId);
    }

    @Get('open/list')
    @ApiOperation({ summary: 'Get all open disputes (for arbiters)' })
    @ApiResponse({
        status: 200,
        description: 'Open disputes retrieved',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    escrow_id: { type: 'string' },
                    status: { type: 'string', enum: ['OPEN'] },
                    reason: { type: 'string' },
                    created_at: { type: 'string' },
                    updated_at: { type: 'string' }
                }
            }
        }
    })
    async getOpenDisputes() {
        return await this.disputeService.getOpenDisputes();
    }

    @Post(':id/close')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Close a resolved dispute' })
    @ApiParam({ name: 'id', description: 'Dispute ID' })
    @ApiResponse({
        status: 200,
        description: 'Dispute closed successfully'
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - dispute not resolved'
    })
    @ApiResponse({
        status: 404,
        description: 'Dispute not found'
    })
    async closeDispute(@Param('id') id: string) {
        return await this.disputeService.closeDispute(id);
    }
}
