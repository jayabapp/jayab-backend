import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { RegisterProfileDto } from 'src/auth/roles/user/dto/register-profile.dto';
import { _IsInt, _IsNumberString, _IsString, _Length, _Min } from 'src/common/pipes/validator-translate.pipe';

export class UpdateProfileDto extends RegisterProfileDto {
  @ApiProperty({ required: false, default: 1 })
  @_Min(1)
  @_IsInt()
  @IsOptional()
  profile_image_id: number;
}

export class UpdateFcmDto {
  @ApiProperty({ description: 'fcm token' })
  @_IsString()
  fcm_token: string;
}
