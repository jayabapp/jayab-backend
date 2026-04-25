import { ApiProperty } from '@nestjs/swagger';
import { BannerPosition } from 'src/banner/common/banner-positions.constant';
import { _IsArray, _IsEnum, _IsNotEmpty } from 'src/common/pipes/validator-translate.pipe';

export class FindAllBannerUserDto {
  @ApiProperty({ enum: BannerPosition, required: true, example: BannerPosition.MAIN_1 })
  @_IsEnum(BannerPosition)
  @_IsNotEmpty()
  position: BannerPosition;
}

export class FindAllBannerUserV2Dto {
  @ApiProperty({ enum: BannerPosition, isArray: true, required: true, example: [BannerPosition.MAIN_1] })
  // @_IsEnum(BannerPosition)
  @_IsArray()
  @_IsNotEmpty()
  positions: BannerPosition[];
}
