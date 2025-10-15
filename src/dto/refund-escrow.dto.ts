import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefundEscrowDto {
    @ApiProperty({ description: 'Signature of the buyer or arbiter authorizing the refund' })
    @IsString()
    @IsNotEmpty()
    signature: string;

    @ApiProperty({ description: 'ID of the signer (buyer or arbiter)' })
    @IsString()
    @IsNotEmpty()
    signer_id: string;

    @ApiProperty({ description: 'Reason for refund', required: false })
    @IsString()
    @IsOptional()
    reason?: string;
}
