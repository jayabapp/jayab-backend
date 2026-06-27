import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsEnum, _IsInt, _IsString, _Min } from 'src/common/pipes/validator-translate.pipe';
import { PropertyPhotoUpgradeRequestStatus } from 'src/property/common/types/property-photo-upgrade-status.type';

export class FindAllPropertyPhotoUpgradeRequestAdminDto extends PaginationDto {
  @ApiProperty({ required: false, enum: PropertyPhotoUpgradeRequestStatus })
  @_IsEnum(PropertyPhotoUpgradeRequestStatus)
  @Transform(({ value }) => +value)
  @IsOptional()
  status?: PropertyPhotoUpgradeRequestStatus;

  @ApiProperty({ required: false, example: 1 })
  @_Min(1)
  @_IsInt()
  @Transform(({ value }) => +value)
  @IsOptional()
  property_id?: number;

  @ApiProperty({ required: false, example: 1 })
  @_Min(1)
  @_IsInt()
  @Transform(({ value }) => +value)
  @IsOptional()
  owner_id?: number;

  @ApiProperty({ required: false, example: '1234' })
  @_IsString()
  @IsOptional()
  property_code?: string;
}
