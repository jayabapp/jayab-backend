import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Validate } from 'class-validator';
import { _IsInt, _IsNotEmpty, _IsString } from 'src/common/pipes/validator-translate.pipe';
import { Type } from 'class-transformer';
import { IsMobileNumber } from 'src/common/validators/is-mobile-number.validator';

export class CreateContentQuestionUserDto {
  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  content_id: number;

  @ApiProperty({ required: true, default: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @_IsNotEmpty()
  question: string;

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  rate: number;

  @ApiProperty({ required: true, default: 'نام نویسنده' })
  @_IsString()
  @_IsNotEmpty()
  author_name: string;

  @ApiProperty({ required: true, default: 'موبایل نویسنده' })
  @Validate(IsMobileNumber)
  @_IsNotEmpty()
  mobile_number: string;
}
