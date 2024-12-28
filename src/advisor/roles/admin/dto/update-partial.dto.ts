import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { AdvisorStatus } from 'src/advisor/common/advisor-status.type';
import { _IsEnum, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class UpdatePartialAdvisorAdminDto {
  @ApiProperty({ enum: AdvisorStatus, required: true, default: AdvisorStatus.APPROVED })
  @_IsEnum(AdvisorStatus)
  @IsOptional()
  status: AdvisorStatus;

  @ApiProperty({ required: false, default: {} })
  @_IsString()
  @IsOptional()
  admin_description: string;
}
