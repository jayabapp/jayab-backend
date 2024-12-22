import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  Req,
  Query,
  BadRequestException,
  Delete,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiImageFile, ApiVideoFile } from './helpers/api-file.decorator';
import { ParseFile } from './pipes/parse-file.pipes';
import { AttachmentService } from './attachment.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { RequestType } from 'src/common/interfaces/user.interface';
import {
  CONTENT_FOLDER,
  BANNER_FOLDER,
  IMAGES_PROFILE_FOLDER,
  CATEGORY_FOLDER,
  FORM_FOLDER,
} from 'src/common/utils/constants/storage-folders';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { AttachmentAdminFolder, AttachmentUserFolder } from './interfaces/attachment-folder.enum';
import { CreateAttachmentAdminDto } from './dto/create-attachment-admin.dto';
import { S3ManagerService } from 'src/s3-manager/s3-manager.service';
import { AttachmentImagePropsType } from './interfaces/attachment-props.type';
import { CreateAttachmentUserDto } from './dto/create-attachment-user.dto';

@ApiTags('📎 Attachment')
@Controller()
export class AttachmentController {
  constructor(
    private readonly attachmentService: AttachmentService,
    private readonly s3: S3ManagerService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                    USER                                    */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({
    description: 'آپلود عکس پروفایل - کاربر',
    operationId: 'USER - Profile image uploader',
  })
  @ApiBearerAuth('user-jwt')
  @UseGuards(UserJwtGuard)
  @Post('attachments/profile')
  @ApiImageFile('file', true)
  async createProfileImage(
    @Req() request: RequestType,
    @UploadedFile(ParseFile) file: Express.Multer.File,
  ): Promise<SuccessResponseArgs> {
    const { user } = request;
    const args: AttachmentImagePropsType = {
      file,
      folder: IMAGES_PROFILE_FOLDER,
      resizeWidth: 256,
      resizeMode: 'square',
      userId: user.id,
    };

    const result = await this.attachmentService.createAttachment(args);
    return { result };
  }

  @ApiOperation({
    description: 'آپلود عکس - کاربر',
    operationId: 'USER - image uploader',
  })
  @Post('attachments')
  @ApiImageFile('file', true)
  async uploadUserImageAttachment(
    @Query() createAttachmentUserDto: CreateAttachmentUserDto,
    @UploadedFile(ParseFile) file: Express.Multer.File,
  ): Promise<SuccessResponseArgs> {
    let args: AttachmentImagePropsType;
    switch (createAttachmentUserDto.type) {
      case AttachmentUserFolder.FORM:
        args = {
          file,
          folder: FORM_FOLDER,
          resizeWidth: 1024,
          resizeMode: 'normal',
          userId: null,
        };
        break;
      default:
        break;
    }

    const result = await this.attachmentService.createAttachment(args);
    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                    ADMIN                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ description: 'آپلود - ادمین', operationId: 'ADMIN - Create attachment' })
  @ApiBearerAuth('admin-jwt')
  @UseGuards(AdminJwtGuard)
  @Post('admin/attachments')
  @ApiImageFile('file', true)
  async uploadAdminImageAttachment(
    @Req() req: RequestType,
    @Query() createAttachmentAdminDto: CreateAttachmentAdminDto,
    @UploadedFile(ParseFile) file: Express.Multer.File,
  ): Promise<SuccessResponseArgs> {
    const admin = req.user;

    let args: AttachmentImagePropsType;
    switch (createAttachmentAdminDto.type) {
      case AttachmentAdminFolder.BANNER:
        args = {
          file,
          folder: BANNER_FOLDER,
          resizeWidth: 2880,
          resizeMode: 'normal',
          adminId: admin.id,
        };
        break;
      case AttachmentAdminFolder.BANNER_SM:
        args = {
          file,
          folder: BANNER_FOLDER,
          resizeWidth: 800,
          resizeMode: 'normal',
          adminId: admin.id,
        };
        break;

      case AttachmentAdminFolder.CONTENT:
        args = {
          file,
          folder: CONTENT_FOLDER,
          resizeWidth: 1024,
          resizeMode: 'normal',
          adminId: admin.id,
        };
        break;

      case AttachmentAdminFolder.CATEGORY:
        args = {
          file,
          folder: CATEGORY_FOLDER,
          resizeWidth: 256,
          resizeMode: 'normal',
          adminId: admin.id,
        };
        break;

      default:
        break;
    }

    if (!args) throw new BadRequestException('FOLDER_NOT_FOUND');

    let result;
    if (file.mimetype == 'image/gif') {
      result = await this.attachmentService.createGif({
        ...args,
        alt: createAttachmentAdminDto.alt,
      });
    } else
      result = await this.attachmentService.createAttachment({
        ...args,
        alt: createAttachmentAdminDto.alt,
      });
    return { result };
  }

  @ApiOperation({ operationId: 'Upload video' })
  @ApiBearerAuth('admin-jwt')
  @UseGuards(AdminJwtGuard)
  @Post('admin/attachments/video')
  @ApiVideoFile('file', true)
  async uploadAdminVideo(
    @Req() request: RequestType,
    @UploadedFile(ParseFile) file: Express.Multer.File,
  ): Promise<SuccessResponseArgs> {
    const admin = request.user;

    const result = await this.attachmentService.createVideo(admin.id, file);
    return { result, messageCode: 'CREATE' };
  }

  @ApiOperation({ description: '', operationId: 'ADMIN - Delete attachment' })
  @ApiBearerAuth('admin-jwt')
  @UseGuards(AdminJwtGuard)
  @Delete('admin/attachments/:id')
  async deleteAdminImageAttachment(@Param('id') id: number): Promise<SuccessResponseArgs> {
    await this.attachmentService.findOne(id);
    await this.attachmentService.remove(id);
    return { messageCode: 'DELETE' };
  }
}
