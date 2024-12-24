import { Controller, Get, Body, UseGuards, Req, Patch, Put } from '@nestjs/common';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequestType } from 'src/common/interfaces/user.interface';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { AttachmentService } from 'src/attachment/attachment.service';
import { UpdateFcmDto, UpdateProfileDto } from 'src/profile/dto/update-profile.dto';
import { ProfileUserService } from './profile-user.service';
import { PROFILE_USER_ROUTE_GROUP } from 'src/profile/common/route-group.constant';

@ApiTags('Profiles - USER')
@ApiBearerAuth('user-jwt')
@UseGuards(UserJwtGuard)
@Controller(PROFILE_USER_ROUTE_GROUP)
export class ProfileUserController {
  constructor(
    private readonly profileUserService: ProfileUserService,
    private readonly attachmentService: AttachmentService,
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

  @ApiOperation({ operationId: 'Update fcm' })
  @Patch('update-fcm')
  async updateFcm(@Req() request: RequestType, @Body() dto: UpdateFcmDto): Promise<SuccessResponseArgs> {
    const { user } = request;
    await this.profileUserService.updateFcm(user, dto);
    return;
  }
}
