import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsEnum, _IsInt, _IsNotEmpty, _IsString } from 'src/common/pipes/validator-translate.pipe';
import { PropertyBadgeStatus } from 'src/property-badge/common/property-badge-status.type';

export class FindAllPropertyBadgeAdminDto extends PaginationDto {
  @ApiProperty({ enum: PropertyBadgeStatus, required: true, example: PropertyBadgeStatus.APPROVED })
  @Type(() => Number)
  @_IsEnum(PropertyBadgeStatus)
  @_IsNotEmpty()
  status: PropertyBadgeStatus;

  @ApiProperty({ required: false, example: '' })
  @_IsString()
  @IsOptional()
  property_title?: string;
}
