import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Validate } from 'class-validator';
import { _IsInt, _IsNotEmpty, _IsString } from 'src/common/pipes/validator-translate.pipe';
import { Type } from 'class-transformer';
import { IsMobileNumber } from 'src/common/validators/is-mobile-number.validator';
import { IsExist } from 'src/common/validators/is-exists.validator';

export class CreateContentQuestionUserDto {
  @ApiProperty({ required: false, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  content_id: number;

  @ApiProperty({ required: false, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @Validate(IsExist, ['product', 'id'])
  @IsOptional()
  product_id: number;

  @ApiProperty({ required: true, example: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @_IsNotEmpty()
  question: string;

  @ApiProperty({ required: false, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  rate: number;

  @ApiProperty({ required: true, example: 'نام نویسنده' })
  @_IsString()
  @_IsNotEmpty()
  author_name: string;

  @ApiProperty({ required: true, example: '09991111111' })
  @Validate(IsMobileNumber)
  @_IsNotEmpty()
  mobile_number: string;
}
