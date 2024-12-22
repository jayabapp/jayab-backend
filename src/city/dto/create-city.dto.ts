import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Validate } from 'class-validator';
import { _IsInt, _IsNotEmpty, _IsString } from 'src/common/pipes/validator-translate.pipe';
import { IsExist } from 'src/common/validators/is-exists.validator';

export class CreateCityDto {
  @ApiProperty({ required: true, title: 'نام' })
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: true, title: 'والد' })
  @_IsInt()
  @IsOptional()
  @Validate(IsExist, ['city', 'id'], { message: 'شهر انتخاب شده وجود ندارد' })
  @_IsNotEmpty()
  parent_id: number;
}
