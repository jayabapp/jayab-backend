import { PickType } from '@nestjs/mapped-types';
import { CreatePropertyAuthorizeAdminDto } from './create.dto';
import {
  PropertyAuthorizeStatuses,
  PropertyAuthorizeStatusesList,
} from 'src/property-authorize/common/property-authorize-status.type';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { _IsEnum, _IsNotEmpty, _Length, _IsString } from 'src/common/pipes/validator-translate.pipe';
import { Transform } from 'class-transformer';

export class UpdatePartialPropertyAuthorizeAdminDto {
  @ApiProperty({ required: true, default: PropertyAuthorizeStatuses.PENDING })
  @_IsEnum(PropertyAuthorizeStatuses)
  @_IsNotEmpty()
  status: number;

  @ApiProperty({ required: false, default: '' })
  @Transform(({ value }) => value.trim())
  @_Length(0, 1024)
  @_IsString()
  @IsOptional()
  admin_description: string;
}
