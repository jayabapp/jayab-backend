import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import {
  _ArrayMaxSize,
  _ArrayNotEmpty,
  _Min,
  _IsInt,
  _IsNotEmpty,
  _IsArray,
} from 'src/common/pipes/validator-translate.pipe';
import { CreatePropertyAdminDto } from './create.dto';

export class UpdatePropertyImagesAdminDto {
  @ApiProperty({ required: true, title: 'تصاویر', default: [1] })
  @_ArrayMaxSize(30)
  @IsNumber({}, { each: true })
  @_ArrayNotEmpty()
  images: number[];

  @ApiProperty({ required: true, title: 'تصاویر', default: [1] })
  @_ArrayMaxSize(30)
  @IsNumber({}, { each: true })
  @_IsArray()
  temp_images: number[];

  @ApiProperty({ required: true, default: 1 })
  @_Min(1)
  @_IsInt()
  @_IsNotEmpty()
  feature_image_id: number;
}
