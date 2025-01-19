import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsInt, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class FindAllSubscriptionAdminDto extends PaginationDto {
  @ApiProperty({ required: false, default: 1 })
  @_IsString()
  @IsOptional()
  mobile_number: string;

  @ApiProperty({ required: false, default: 1 })
  @_IsString()
  @IsOptional()
  property_id: string;

  @ApiProperty({ required: false, default: 1 })
  @_IsString()
  @IsOptional()
  advisor_id: string;

  // @ApiProperty({ required: false, default: '' })
  // @_IsString()
  // @IsOptional()
  // mobile_number: string;
}
