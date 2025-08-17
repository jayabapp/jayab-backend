import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { AdvisorStatus } from 'src/advisor/common/advisor-status.type';
import { _IsEnum, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class UpdatePartialOwnerAdminDto {
  @ApiProperty({ enum: AdvisorStatus, required: true, example: AdvisorStatus.APPROVED })
  @_IsEnum(AdvisorStatus)
  @Type(() => Number)
  @IsOptional()
  status: AdvisorStatus;

  @ApiProperty({ required: false, example: {} })
  @_IsString()
  @IsOptional()
  admin_description: string;
}
