import { ApiProperty } from '@nestjs/swagger';
import { Validate } from 'class-validator';
import { _IsInt, _IsNotEmpty, _Min } from 'src/common/pipes/validator-translate.pipe';
import { Type } from 'class-transformer';
import { IsExist } from 'src/common/validators/is-exists.validator';

export class CreateBookmarkUserDto {
  @ApiProperty({ required: true, example: 1 })
  @Validate(IsExist, ['property', 'id'])
  @_Min(1)
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  property_id: number;
}
