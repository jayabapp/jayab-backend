import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { _ArrayNotEmpty, _IsEnum } from 'src/common/pipes/validator-translate.pipe';
import { PropertyOptionGroup } from 'src/property-option/common/property-option-groups.type';

export class FindAllPropertyOptionUserDto {
  @ApiProperty({
    required: true,
    example: ['PROPERTY_TYPE', 'ACCESS'],
    type: String,
    isArray: true,
  })
  // @_IsEnum(PropertyOptionGroup)
  @_ArrayNotEmpty()
  group: PropertyOptionGroup[];
}
