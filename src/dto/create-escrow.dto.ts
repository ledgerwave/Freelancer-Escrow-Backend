import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEscrowDto {
    @ApiProperty({ description: 'ID of the gig being purchased' })
    @IsString()
    @IsNotEmpty()
    gig_id: string;

    @ApiProperty({ description: 'ID of the buyer' })
    @IsString()
    @IsNotEmpty()
    buyer_id: string;

    @ApiProperty({ description: 'Escrow amount in ADA', minimum: 1 })
    @IsNumber()
    @IsPositive()
    amount: number;

    @ApiProperty({ description: 'Escrow expiry date (ISO string)' })
    @IsString()
    @IsNotEmpty()
    expires_at: string;
}
