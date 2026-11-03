import { _IsInt, _IsString, _Max, _Min } from 'src/common/pipes/validator-translate.pipe';
import { MAP_MAX_ZOOM, MAP_MIN_ZOOM } from 'src/property/common/helpers/map-clustering.helper';
import { FindAllPropertyUserDto } from './find-all.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { LocaleDto } from 'src/common/dto/locale.dto';
import { Type } from 'class-transformer';

export class PropertyMapUserDto extends OmitType(FindAllPropertyUserDto, [
  'page',
  'per_page',
  'skip',
  'sort_type',
  'count_only',
  'bbox',
] as const) {
  @ApiProperty({ required: true, title: 'محدوده نقشه', example: '51.2,35.5,51.6,35.9' })
  @_IsString()
  bbox: string;

  @ApiProperty({ required: true, title: 'زوم', minimum: MAP_MIN_ZOOM, maximum: MAP_MAX_ZOOM })
  @Type(() => Number)
  @_IsInt()
  @_Min(MAP_MIN_ZOOM)
  @_Max(MAP_MAX_ZOOM)
  zoom: number;
}

export class PropertyPriceHistogramUserDto extends OmitType(FindAllPropertyUserDto, [
  'page',
  'per_page',
  'skip',
  'sort_type',
  'count_only',
  'min_price',
  'max_price',
] as const) {}

export class PropertyMapPreviewUserDto extends LocaleDto {}
