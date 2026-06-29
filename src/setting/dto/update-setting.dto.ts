import { ApiProperty } from '@nestjs/swagger';
import { _IsInt, _IsNotEmpty, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class UpdateSettingDto {
  @ApiProperty({ example: 'مقدار', required: true })
  @_IsString()
  @_IsNotEmpty()
  value: string;
}

export class UpdateRobotTxtDto {
  @ApiProperty({ title: 'محتوا', required: true })
  @_IsString()
  @_IsNotEmpty()
  robot_text: string;
}

export class UpdateLlmsTxtDto {
  @ApiProperty({ title: 'محتوا', required: true })
  @_IsString()
  @_IsNotEmpty()
  llms_text: string;
}
