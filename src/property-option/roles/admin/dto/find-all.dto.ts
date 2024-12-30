import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsEnum, _IsInt, _IsString } from 'src/common/pipes/validator-translate.pipe';
import { PropertyOptionGroup } from 'src/property-option/common/property-option-groups.type';

export class FindAllPropertyOptionAdminDto extends PaginationDto {
  @ApiProperty({ required: false, default: 1 })
  @_IsEnum(PropertyOptionGroup)
  @IsOptional()
  group: PropertyOptionGroup;

  @ApiProperty({ required: false, default: '' })
  @_IsString()
  @IsOptional()
  title: string;
}
