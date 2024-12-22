import { ApiProperty } from '@nestjs/swagger';
import { BannerPosition } from 'src/banner/common/banner-positions.constant';
import { _IsEnum, _IsNotEmpty } from 'src/common/pipes/validator-translate.pipe';

export class FindAllBannerUserDto {
  @ApiProperty({ enum: BannerPosition, required: true, default: BannerPosition.MAIN })
  @_IsEnum(BannerPosition)
  @_IsNotEmpty()
  position: BannerPosition;
}
