import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { USER_ROUTE_GROUP } from 'src/bookmark/common/route-group.constant';
import { BookmarkUserService } from './bookmark.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { RequestType } from 'src/common/interfaces/user.interface';
import { CreateBookmarkUserDto } from './dto/create.dto';
import { PropertyUserService } from 'src/property/roles/user/user.service';

@ApiTags('Bookmark - USER')
@UseGuards(UserJwtGuard)
@ApiBearerAuth('user-jwt')
@Controller(USER_ROUTE_GROUP)
export class BookmarkUserController {
  constructor(
    private readonly bookmarkUserService: BookmarkUserService,
    private readonly propertyUserService: PropertyUserService,
  ) {}

  @ApiOperation({ summary: 'Create', description: '' })
  @Post()
  async createOrDelete(
    @Req() request: RequestType,
    @Body() dto: CreateBookmarkUserDto,
  ): Promise<SuccessResponseArgs> {
    const user = request.user;
    const result = await this.bookmarkUserService.createOrDelete(user.id, dto);
    return { result: { bookmarks: result } };
  }

  @ApiOperation({ summary: 'Find All', description: '' })
  @Get()
  async findAll(@Req() request: RequestType): Promise<SuccessResponseArgs> {
    const user = request.user;
    const propertyIds = await this.bookmarkUserService.findAllIds(user.id);
    const result = await this.propertyUserService.findAll({ page: 1, per_page: 100 }, false, propertyIds);
    return { result: result.data };
  }

  @ApiOperation({ summary: 'Find All Property ids', description: '' })
  @Get('property-ids')
  async findAllIds(@Req() request: RequestType): Promise<SuccessResponseArgs> {
    const user = request.user;
    const result = await this.bookmarkUserService.findAllIds(user.id);
    return { result };
  }
}
