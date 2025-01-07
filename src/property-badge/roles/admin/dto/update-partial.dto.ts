import { PickType } from '@nestjs/mapped-types';
import { CreatePropertyBadgeAdminDto } from './create.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { _IsEnum, _IsNotEmpty, _Length, _IsString } from 'src/common/pipes/validator-translate.pipe';
import { PropertyBadgeStatus } from 'src/property-badge/common/property-badge-status.type';
import { Transform } from 'class-transformer';

export class UpdatePartialPropertyBadgeAdminDto {
  @ApiProperty({ enum: PropertyBadgeStatus, required: true, default: PropertyBadgeStatus.APPROVED })
  @_IsEnum(PropertyBadgeStatus)
  @_IsNotEmpty()
  status: PropertyBadgeStatus;

  @ApiProperty({ required: false, default: '' })
  @Transform(({ value }) => value.trim())
  @_Length(0, 1024)
  @_IsString()
  @IsOptional()
  admin_description: string;
}
