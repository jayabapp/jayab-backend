import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { _IsEnum } from 'src/common/pipes/validator-translate.pipe';
import { PropertyOptionGroup } from 'src/property-option/common/property-option-groups.type';

export class FindAllPropertyOptionUserDto {
  @ApiProperty({ required: true, enum: PropertyOptionGroup, default: PropertyOptionGroup.ACCESS })
  @IsOptional()
  @_IsEnum(PropertyOptionGroup)
  group: PropertyOptionGroup;
}
