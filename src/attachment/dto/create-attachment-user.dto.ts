import { ApiProperty } from '@nestjs/swagger';
import { _IsEnum, _IsNotEmpty, _IsString } from 'src/common/pipes/validator-translate.pipe';
import { AttachmentUserFolder } from '../interfaces/attachment-folder.enum';

export class CreateAttachmentUserDto {
  @ApiProperty({ enum: AttachmentUserFolder })
  @_IsEnum(AttachmentUserFolder)
  @_IsString()
  @_IsNotEmpty()
  type: AttachmentUserFolder;
}
