import { ApiProperty } from '@nestjs/swagger';
import { _IsBoolean, _IsNotEmpty } from 'src/common/pipes/validator-translate.pipe';
import { LOREM_IPSUM_TITLE } from 'src/common/utils/constants/faker.constant';

export class UpdatePartialPropertyReportAdminDto {
  @ApiProperty({ required: true, example: LOREM_IPSUM_TITLE })
  @_IsBoolean()
  // @Transform(({ value }) => (value && value === 1 ? true : false))
  @_IsNotEmpty()
  seen_by_admin: boolean;
}
// export class UpdatePartialPostReportAdminDto extends PickType(CreatePostReportAdminDto,['']) {}
