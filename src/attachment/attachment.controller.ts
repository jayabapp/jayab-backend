import { ApiBearerAuth, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { AttachmentAdminFolder, AttachmentUserFolder } from './interfaces/attachment-folder.enum';
import { ApiImageFile, ApiVideoFile } from './helpers/api-file.decorator';
import { CreateAttachmentAdminDto } from './dto/create-attachment-admin.dto';
import { AttachmentImagePropsType } from './interfaces/attachment-props.type';
import { CreateAttachmentUserDto } from './dto/create-attachment-user.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { AttachmentService } from './attachment.service';
import { S3ManagerService } from 'src/s3-manager/s3-manager.service';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { RequestType } from 'src/common/interfaces/user.interface';
import { ParseFile } from './pipes/parse-file.pipes';
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
  UnprocessableEntityException,
  Get,
  Header,
  ParseIntPipe,
  StreamableFile,
} from '@nestjs/common';
import {
  CONTENT_FOLDER,
  BANNER_FOLDER,
  IMAGES_PROFILE_FOLDER,
  CATEGORY_FOLDER,
  IMAGES_OWNER_SELFIE_FOLDER,
  IMAGES_ADVISOR_NATIONAL_CARD_FOLDER,
  IMAGES_ADVISOR_DOCUMENT_FOLDER,
  IMAGES_OWNER_PROPERTY_FOLDER,
  CHAT_MEDIA_FOLDER,
  IMAGES_OWNER_PROPERTY_DOCS_FOLDER,
} from 'src/common/utils/constants/storage-folders';
import {
  BLOG_IMAGE_ENCODING_QUALITY,
  BLOG_IMAGE_MAX_DIMENSION,
  PROPERTY_IMAGE_ENCODING_QUALITY,
  PROPERTY_IMAGE_MAX_DIMENSION,
} from './constants/image-processing.constant';

@ApiTags('📎 Attachment')
@Controller()
export class AttachmentController {
  constructor(
    private readonly attachmentService: AttachmentService,
    private readonly s3: S3ManagerService,
  ) {}

  @ApiOperation({ summary: 'Download a public property image as WebP' })
  @ApiProduces('image/webp')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  @Header('X-Content-Type-Options', 'nosniff')
  @Get('attachments/:id/download')
  async downloadPublicPropertyImage(@Param('id', ParseIntPipe) id: number): Promise<StreamableFile> {
    const { contentLength, stream } = await this.attachmentService.getPublicPropertyImageDownload(id);
    return new StreamableFile(stream, {
      type: 'image/webp',
      disposition: `attachment; filename="jayab-property-image-${id}.webp"`,
      length: contentLength,
    });
  }

  @ApiOperation({
    description: 'آپلود عکس - کاربر',
    summary: 'USER - image uploader',
  })
  @ApiBearerAuth('user-jwt')
  @UseGuards(UserJwtGuard)
  @Post('attachments')
  @ApiImageFile('file', true)
  async uploadUserImageAttachment(
    @Req() request: RequestType,
    @Query() createAttachmentUserDto: CreateAttachmentUserDto,
    @UploadedFile(ParseFile) file: Express.Multer.File,
  ): Promise<SuccessResponseArgs> {
    const { user } = request;
    let args: AttachmentImagePropsType;

    switch (createAttachmentUserDto.type) {
      case AttachmentUserFolder.PROFILE:
        args = {
          file,
          folder: IMAGES_PROFILE_FOLDER,
          resizeWidth: 512,
          resizeMode: 'square',
          userId: user.id,
        };
        break;

      case AttachmentUserFolder.OWNER_SELFIE_IMAGE:
        args = {
          file,
          folder: IMAGES_OWNER_SELFIE_FOLDER,
          resizeWidth: 512,
          resizeMode: 'square',
          userId: user.id,
        };
        break;

      case AttachmentUserFolder.ADVISOR_NATIONAL_CARD_IMAGE:
        args = {
          file,
          folder: IMAGES_ADVISOR_NATIONAL_CARD_FOLDER,
          resizeWidth: 1024,
          resizeMode: 'normal',
          userId: user.id,
        };
        break;

      case AttachmentUserFolder.ADVISOR_DOCUMENT_IMAGE:
        args = {
          file,
          folder: IMAGES_ADVISOR_DOCUMENT_FOLDER,
          resizeWidth: 1024,
          resizeMode: 'normal',
          userId: user.id,
        };
        break;

      case AttachmentUserFolder.OWNER_PROPERTY_IMAGE:
        if (!user.owner_id) throw new UnprocessableEntityException('FORBIDDEN');
        args = {
          file,
          folder: IMAGES_OWNER_PROPERTY_FOLDER,
          encodingQuality: PROPERTY_IMAGE_ENCODING_QUALITY,
          resizeWidth: PROPERTY_IMAGE_MAX_DIMENSION,
          resizeMode: 'normal',
          userId: user.id,
        };
        break;

      case AttachmentUserFolder.OWNER_PROPERTY_DOCS:
        if (!user.owner_id) throw new UnprocessableEntityException('FORBIDDEN');
        args = {
          file,
          folder: IMAGES_OWNER_PROPERTY_DOCS_FOLDER,
          resizeWidth: 1024,
          resizeMode: 'normal',
          userId: user.id,
        };
        break;

      case AttachmentUserFolder.CHAT:
        args = {
          file,
          folder: CHAT_MEDIA_FOLDER,
          resizeWidth: 1024,
          resizeMode: 'normal',
          userId: user.id,
        };
        break;

      default:
        break;
    }

    const result = await this.attachmentService.createAttachment(args);
    return { result };
  }

  @ApiOperation({ description: 'آپلود - ادمین', summary: 'ADMIN - Create attachment' })
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
          resizeWidth: 2048,
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
      case AttachmentAdminFolder.BLOG:
        args = {
          file,
          folder: CONTENT_FOLDER,
          encodingQuality: BLOG_IMAGE_ENCODING_QUALITY,
          resizeWidth: BLOG_IMAGE_MAX_DIMENSION,
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

      case AttachmentAdminFolder.OWNER_PROPERTY_IMAGE:
        args = {
          file,
          folder: IMAGES_OWNER_PROPERTY_FOLDER,
          encodingQuality: PROPERTY_IMAGE_ENCODING_QUALITY,
          resizeWidth: PROPERTY_IMAGE_MAX_DIMENSION,
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

  @ApiOperation({ summary: 'Upload video' })
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

  @ApiOperation({ description: '', summary: 'ADMIN - Delete attachment' })
  @ApiBearerAuth('admin-jwt')
  @UseGuards(AdminJwtGuard)
  @Delete('admin/attachments/:id')
  async deleteAdminImageAttachment(@Param('id') id: number): Promise<SuccessResponseArgs> {
    await this.attachmentService.findOne(id);
    await this.attachmentService.remove(id);
    return { messageCode: 'DELETE' };
  }
}
