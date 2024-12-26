import {
  Controller,
  Get,
  Body,
  UseGuards,
  Req,
  Patch,
  Put,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequestType } from 'src/common/interfaces/user.interface';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { AttachmentService } from 'src/attachment/attachment.service';
import { UpdateFcmDto, UpdateProfileDto } from 'src/profile/dto/update-profile.dto';
import { ProfileUserService } from './profile-user.service';
import { PROFILE_USER_ROUTE_GROUP } from 'src/profile/common/route-group.constant';
import { RegisterOwnerUserDto } from './dto/register.dto';
import { OwnerUserService } from 'src/owner/roles/user/user.service';

@ApiTags('Profiles - USER')
@ApiBearerAuth('user-jwt')
@UseGuards(UserJwtGuard)
@Controller(PROFILE_USER_ROUTE_GROUP)
export class ProfileUserController {
  constructor(
    private readonly profileUserService: ProfileUserService,
    private readonly attachmentService: AttachmentService,
    private readonly ownerUserService: OwnerUserService,
  ) {}

  @ApiOperation({ operationId: 'Get user profile' })
  @Get()
  async getProfile(@Req() request: RequestType): Promise<SuccessResponseArgs> {
    const user = request.user;
    const result = await this.profileUserService.findOne(user.id);

    return { result };
  }

  @ApiOperation({ operationId: 'Update profile' })
  @Put()
  async updateProfile(
    @Req() request: RequestType,
    @Body() dto: UpdateProfileDto,
  ): Promise<SuccessResponseArgs> {
    const user = request.user;
    if (dto.profile_image_id)
      await this.attachmentService.validateFileOwner([dto.profile_image_id], user.id, 1);
    await this.profileUserService.updateProfile(user.id, dto);
    return { messageCode: 'UPDATE' };
  }

  /**
   * ابتدا مالکو ایجاد میکنیم و سپس صحت آن را بررسی میکنیم
   */
  @ApiOperation({ operationId: 'Register owner' })
  @Put('register/owner')
  async registerOwner(
    @Req() request: RequestType,
    @Body() dto: RegisterOwnerUserDto,
  ): Promise<SuccessResponseArgs> {
    const user = request.user;

    /* -------------------------------------------------------------------------- */
    // check duplicate request
    if (user.owner_id) throw new BadRequestException('REGISTER_OWNER1');

    /* -------------------------------------------------------------------------- */
    // check the national code repetition
    const nationalCodeIsInUse = await this.ownerUserService.findOneByNationalCode(dto.national_code);
    if (nationalCodeIsInUse) throw new ConflictException('REGISTER_OWNER2');

    /* -------------------------------------------------------------------------- */
    // check selfie image
    await this.attachmentService.validateFileOwner([dto.selfie_image_id], user.id, 1);

    /* -------------------------------------------------------------------------- */
    // create
    const owner = await this.profileUserService.registerOwner(user.id, dto);

    /* -------------------------------------------------------------------------- */
    // TODO: validate the national code
    await this.profileUserService.validateNationalCodeWebService(owner);

    return { messageCode: 'CREATE' };
  }

  @ApiOperation({ operationId: 'Update fcm' })
  @Patch('update-fcm')
  async updateFcm(@Req() request: RequestType, @Body() dto: UpdateFcmDto): Promise<SuccessResponseArgs> {
    const { user } = request;
    await this.profileUserService.updateFcm(user, dto);
    return;
  }
}
