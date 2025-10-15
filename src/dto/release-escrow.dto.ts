import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReleaseEscrowDto {
    @ApiProperty({ description: 'Signature of the buyer or arbiter authorizing the release' })
    @IsString()
    @IsNotEmpty()
    signature: string;

    @ApiProperty({ description: 'ID of the signer (buyer or arbiter)' })
    @IsString()
    @IsNotEmpty()
    signer_id: string;
}
