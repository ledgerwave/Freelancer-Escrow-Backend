import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDisputeDto {
    @ApiProperty({ description: 'ID of the escrow being disputed' })
    @IsString()
    @IsNotEmpty()
    escrow_id: string;

    @ApiProperty({ description: 'Reason for opening the dispute' })
    @IsString()
    @IsNotEmpty()
    reason: string;

    @ApiProperty({ description: 'ID of the user opening the dispute' })
    @IsString()
    @IsNotEmpty()
    complainant_id: string;
}
