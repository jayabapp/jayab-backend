import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { _IsBoolean } from 'src/common/pipes/validator-translate.pipe';
import { IsOptional, IsPositive } from 'class-validator';

export class UpdatePropertyPhotoUpgradeRequestItemAdminDto {
  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @_IsBoolean()
  is_edited?: boolean;

  @ApiProperty({ required: false, example: 123 })
  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  attachment_id?: number;
}
