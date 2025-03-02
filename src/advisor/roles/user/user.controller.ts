import {
  Body,
  Controller,
  // Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { USER_ROUTE_GROUP } from 'src/advisor/common/route-group.constant';
import { AdvisorUserService } from './user.service';
import { CreateAdvisorUserDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdateAdvisorUserDto } from './dto/update.dto';
import { FindAllAdvisorUserDto } from './dto/find-all.dto';
import { AddRateUserDto } from '../admin/dto/create.dto';
import { RequestType } from 'src/common/interfaces/user.interface';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { FIVE_MINUTES_TTL } from 'src/common/utils/constants/cache-ttl.constant';

@ApiTags('Advisor - USER')
@Controller(USER_ROUTE_GROUP)
export class AdvisorUserController {
  constructor(private readonly advisorUserService: AdvisorUserService) {}

  @ApiOperation({ operationId: 'Find All', description: '' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(FIVE_MINUTES_TTL)
  @Get()
  async findAll(@Query() dto: FindAllAdvisorUserDto): Promise<SuccessResponseArgs> {
    const result = await this.advisorUserService.findAll(dto);
    return { result };
  }

  @ApiOperation({ operationId: 'Find One', description: '' })
  @UseGuards(UserJwtGuard)
  @ApiBearerAuth('user-jwt')
  @Get(':advisorId')
  async findOne(
    @Req() req: RequestType,
    @Param('advisorId', ParseIntPipe) advisorId: number,
  ): Promise<SuccessResponseArgs> {
    const user = req.user;
    const result = await this.advisorUserService.findOne(user.id, advisorId);
    return { result };
  }

  @ApiOperation({ operationId: 'Init rate', description: '' })
  @UseGuards(UserJwtGuard)
  @ApiBearerAuth('user-jwt')
  @Post(':advisorId/rate/init')
  async initRate(
    @Req() req: RequestType,
    @Param('advisorId', ParseIntPipe) advisorId: number,
  ): Promise<SuccessResponseArgs> {
    const user = req.user;

    /*  */
    const advisor = await this.advisorUserService.findById(user.id, advisorId);

    /*  */
    await this.advisorUserService.initRate(user.id, advisor.id);
    return {};
  }

  @ApiOperation({ operationId: 'Add rate', description: '' })
  @UseGuards(UserJwtGuard)
  @ApiBearerAuth('user-jwt')
  @Post(':advisorId/rate/add')
  async addRate(
    @Req() req: RequestType,
    @Param('advisorId', ParseIntPipe) advisorId: number,
    @Body() dto: AddRateUserDto,
  ): Promise<SuccessResponseArgs> {
    const user = req.user;

    /*  */
    const advisor = await this.advisorUserService.findById(user.id, advisorId);

    /*  */
    await this.advisorUserService.addRate(user.id, advisor.id, dto);
    return { messageCode: 'CREATE' };
  }
}
