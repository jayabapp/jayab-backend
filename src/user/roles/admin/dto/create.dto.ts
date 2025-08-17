import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { _IsInt, _IsNotEmpty, _IsString } from 'src/common/pipes/validator-translate.pipe';
import { Type } from 'class-transformer';

export class CreateUserAdminDto {
  @ApiProperty({ required: false, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  profile_id: number;

  @ApiProperty({ required: false, example: '170170000000123450080000' })
  @_IsString()
  @IsOptional()
  sheba: string;

  @ApiProperty({ required: true, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  wallet_balance: number;
}
