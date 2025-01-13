import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { USER_ROUTE_GROUP } from 'src/favorite/common/route-group.constant';
import { FavoriteUserService } from './user.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { RequestType } from 'src/common/interfaces/user.interface';
import { CreateFavoriteUserDto } from './dto/create.dto';
import { FindAllFavoriteUserDto } from './dto/find-all.dto';

@ApiTags('Favorite - USER')
@UseGuards(UserJwtGuard)
@ApiBearerAuth('user-jwt')
@Controller(USER_ROUTE_GROUP)
export class FavoriteUserController {
  constructor(private readonly favoriteUserService: FavoriteUserService) {}

  @ApiOperation({ operationId: 'Create', description: '' })
  @Post()
  async createOrDelete(
    @Req() request: RequestType,
    @Body() dto: CreateFavoriteUserDto,
  ): Promise<SuccessResponseArgs> {
    const user = request.user;
    const result = await this.favoriteUserService.createOrDelete(user.id, dto);
    return { result: { favorites: result } };
  }

  // @ApiOperation({ operationId: 'Find All', description: '' })
  // @Get()
  // async findAll(
  //   @Req() request: RequestType,
  //   @Query() dto: FindAllFavoriteUserDto,
  // ): Promise<SuccessResponseArgs> {
  //   const user = request.user;
  //   const result = await this.favoriteUserService.findAll(user.id, dto);

  //   return { result };
  // }

  @ApiOperation({ operationId: 'Find All Employee ids', description: '' })
  @Get('property-ids')
  async findAllIds(@Req() request: RequestType): Promise<SuccessResponseArgs> {
    const user = request.user;
    const result = await this.favoriteUserService.findAllIds(user.id);
    return { result };
  }
}
