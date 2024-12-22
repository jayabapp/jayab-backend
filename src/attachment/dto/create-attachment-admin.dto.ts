import { ApiProperty } from '@nestjs/swagger';
import { _IsEnum, _IsNotEmpty, _IsString } from 'src/common/pipes/validator-translate.pipe';
import { AttachmentAdminFolder } from '../interfaces/attachment-folder.enum';
import { IsOptional } from 'class-validator';

export class CreateAttachmentAdminDto {
  @ApiProperty({ enum: AttachmentAdminFolder })
  @_IsEnum(AttachmentAdminFolder)
  @_IsString()
  @_IsNotEmpty()
  type: AttachmentAdminFolder;

  @ApiProperty({ title: 'alt' })
  @_IsString()
  @IsOptional()
  alt: string;
}
