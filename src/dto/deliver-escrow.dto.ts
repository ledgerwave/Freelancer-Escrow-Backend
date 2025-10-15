import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeliverEscrowDto {
    @ApiProperty({ description: 'IPFS hash of the delivered work' })
    @IsString()
    @IsNotEmpty()
    delivery_hash: string;

    @ApiProperty({ description: 'Optional message for the buyer', required: false })
    @IsString()
    @IsOptional()
    message?: string;
}
