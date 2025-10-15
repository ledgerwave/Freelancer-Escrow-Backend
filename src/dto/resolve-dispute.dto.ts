import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DisputeOutcome } from '../entities/dispute.entity';

export class ResolveDisputeDto {
    @ApiProperty({ description: 'Signature of the arbiter authorizing the resolution' })
    @IsString()
    @IsNotEmpty()
    signature: string;

    @ApiProperty({ description: 'ID of the arbiter resolving the dispute' })
    @IsString()
    @IsNotEmpty()
    arbiter_id: string;

    @ApiProperty({
        description: 'Resolution outcome',
        enum: DisputeOutcome
    })
    @IsEnum(DisputeOutcome)
    outcome: DisputeOutcome;
}
