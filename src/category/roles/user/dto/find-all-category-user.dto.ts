import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { _IsInt, _IsNotEmpty } from 'src/common/pipes/validator-translate.pipe';

export class FindAllCategoryUserDto {
  @ApiProperty({ required: true, example: 1 })
  @_IsInt()
  @Transform(({ value }) => +value)
  @_IsNotEmpty()
  parent_id: number;
}
