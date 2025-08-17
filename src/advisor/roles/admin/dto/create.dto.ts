import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean,
  _IsEnum,
} from 'src/common/pipes/validator-translate.pipe';
import { Type } from 'class-transformer';
import { RegisterAdvisorUserDto } from 'src/profile/roles/user/dto/register.dto';

// export class CreateAdvisorAdminDto extends PartialType(OmitType(RegisterAdvisorUserDto,[''])) {}
export class CreateAdvisorAdminDto extends RegisterAdvisorUserDto {}

export class AddRateUserDto {
  @ApiProperty({ required: true, example: 25 })
  @_IsEnum([25, 50, 75, 100])
  @_IsInt()
  @_IsNotEmpty()
  advisor_behavior: number;

  @ApiProperty({ required: true, example: 50 })
  @_IsEnum([25, 50, 75, 100])
  @_IsInt()
  @_IsNotEmpty()
  advisor_responsibility: number;

  @ApiProperty({ required: true, example: 75 })
  @_IsEnum([25, 50, 75, 100])
  @_IsInt()
  @_IsNotEmpty()
  response_speed_and_followup: number;
}
