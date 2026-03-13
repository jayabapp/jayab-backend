import {
  BadRequestException,
  Body,
  Controller,
  // Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
// import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { USER_ROUTE_GROUP } from 'src/property-reserve/common/route-group.constant';
import { PropertyReserveUserService } from './user.service';
import { CreatePropertyReserveUserDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdatePropertyReserveUserDto } from './dto/update.dto';
import { FindAllPropertyReserveUserDto } from './dto/find-all.dto';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { RequestType } from 'src/common/interfaces/user.interface';
import { InjectQueue } from '@nestjs/bull';
import {
  RESERVE_EXPIRE_JOB,
  RESERVE_QUEUE,
  RESERVE_SMS_JOB,
} from 'src/property-reserve/processors/queue-name.constants';
import { Queue } from 'bull';
import { RESERVE_TTL_MINUTES } from 'src/property-reserve/common/constants/reserve.constant';

@ApiTags('PropertyReserve - USER')
@UseGuards(UserJwtGuard)
@ApiBearerAuth('user-jwt')
@Controller(USER_ROUTE_GROUP)
export class PropertyReserveUserController {
  constructor(
    @InjectQueue(RESERVE_QUEUE) private readonly queue: Queue,
    private readonly propertyReserveUserService: PropertyReserveUserService,
  ) {}

  @ApiOperation({ summary: 'Create', description: '' })
  @Post()
  async create(
    @Req() req: RequestType,
    @Body() dto: CreatePropertyReserveUserDto,
  ): Promise<SuccessResponseArgs> {
    const user = req.user;

    //create reserve
    const reserve = await this.propertyReserveUserService.create(dto, user.id);

    //send sms
    await this.queue.add(RESERVE_SMS_JOB, { reserveId: reserve.id });

    //expire
    await this.queue.add(
      RESERVE_EXPIRE_JOB,
      { reserveId: reserve.id },
      { delay: RESERVE_TTL_MINUTES * 60 * 1000 },
    );

    return;
  }

  @ApiOperation({ summary: 'Find All', description: '' })
  @Get()
  async findAll(
    @Req() req: RequestType,
    @Query() dto: FindAllPropertyReserveUserDto,
  ): Promise<SuccessResponseArgs> {
    const user = req.user;

    const result = await this.propertyReserveUserService.findAll(dto, user.id);

    return { result };
  }

  @ApiOperation({ summary: 'Cancel', description: '' })
  @Patch(':propertyReserveId')
  async cancel(
    @Req() req: RequestType,
    @Param('propertyReserveId', ParseIntPipe) propertyReserveId: number,
  ): Promise<SuccessResponseArgs> {
    const user = req.user;
    const reserve = await this.propertyReserveUserService.findOne(propertyReserveId, user.id);
    if (reserve.expired_at) throw new BadRequestException('RESERVE5');

    const result = await this.propertyReserveUserService.cancel(propertyReserveId);

    return { result, messageCode: 'RESERVE1' };
  }
}
