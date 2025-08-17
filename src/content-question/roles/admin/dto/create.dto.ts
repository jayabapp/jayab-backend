import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Validate } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean,
} from 'src/common/pipes/validator-translate.pipe';
import { Transform, Type } from 'class-transformer';
import { IsExist } from 'src/common/validators/is-exists.validator';

export class CreateContentQuestionAdminDto {
  @ApiProperty({ required: true, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @Validate(IsExist, ['content', 'id'])
  @IsOptional()
  content_id: number;

  @ApiProperty({ required: true, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @Validate(IsExist, ['product', 'id'])
  @IsOptional()
  product_id: number;

  @ApiProperty({ required: true, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @Validate(IsExist, ['contentCategory', 'id'])
  @Transform((data) => {
    if (data.obj?.content_id) return null;
    else return data.value;
  })
  @IsOptional()
  content_category_id: number;

  @ApiProperty({ required: true, example: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @_IsNotEmpty()
  question: string;

  @ApiProperty({ required: false, example: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @IsOptional()
  answer: string;

  @ApiProperty({ required: false, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  image_id: number;

  @ApiProperty({ required: false, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  admin_id: number;

  @ApiProperty({ required: false, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  rate: number;

  @ApiProperty({ required: false, example: 'نام نویسنده' })
  @_IsString()
  @IsOptional()
  author_name: string;

  @ApiProperty({ required: false, example: true })
  @Type(() => Boolean)
  @_IsBoolean()
  @IsOptional()
  is_publish: boolean;
}
