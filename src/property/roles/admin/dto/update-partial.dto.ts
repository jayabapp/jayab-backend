import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { _IsEnum, _IsString } from 'src/common/pipes/validator-translate.pipe';
import { PropertyStatuses } from 'src/property/common/types/property-status.type';

export class UpdatePartialPropertyAdminDto {
  @ApiProperty({ enum: PropertyStatuses, required: true, example: PropertyStatuses.DELETED })
  @_IsEnum(PropertyStatuses)
  @IsOptional()
  status: PropertyStatuses;

  @ApiProperty({ required: false, example: {} })
  @_IsString()
  @IsOptional()
  admin_description: string;
}
