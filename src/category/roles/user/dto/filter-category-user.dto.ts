import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { _IsBoolean, _IsInt, _IsNotEmpty } from 'src/common/pipes/validator-translate.pipe';

export class FilterCategoryUserDto {
  @ApiProperty({ required: false, example: false })
  @_IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    return false;
  })
  @IsOptional()
  is_feature_category: boolean;
}
