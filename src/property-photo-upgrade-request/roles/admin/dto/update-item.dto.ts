import { ApiProperty } from '@nestjs/swagger';
import { _IsBoolean } from 'src/common/pipes/validator-translate.pipe';

export class UpdatePropertyPhotoUpgradeRequestItemAdminDto {
  @ApiProperty({ required: true, example: true })
  @_IsBoolean()
  is_edited: boolean;
}
