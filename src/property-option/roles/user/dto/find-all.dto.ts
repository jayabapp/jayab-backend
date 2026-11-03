import { PropertyOptionGroup } from 'src/property-option/common/property-option-groups.type';
import { _ArrayNotEmpty } from 'src/common/pipes/validator-translate.pipe';
import { ApiProperty } from '@nestjs/swagger';
import { LocaleDto } from 'src/common/dto/locale.dto';

export class FindAllPropertyOptionUserDto extends LocaleDto {
  @ApiProperty({
    required: true,
    example: ['PROPERTY_TYPE', 'ACCESS'],
    enum: PropertyOptionGroup,
    type: String,
    isArray: true,
  })
  // @_IsEnum(PropertyOptionGroup)
  @_ArrayNotEmpty()
  group: PropertyOptionGroup[];
}
