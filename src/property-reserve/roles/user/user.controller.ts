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
import { RESERVE_QUEUE, RESERVE_SMS_JOB } from 'src/property-reserve/processors/queue-name.constants';
import { Queue } from 'bull';

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
    const reserve = await this.propertyReserveUserService.create(dto, user.id);
    await this.queue.add(RESERVE_SMS_JOB, { reserveId: reserve.id });
    return {};
  }

  @ApiOperation({ summary: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllPropertyReserveUserDto): Promise<SuccessResponseArgs> {
    const result = await this.propertyReserveUserService.findAll(dto);

    return { result };
  }

  @ApiOperation({ summary: 'Find One', description: '' })
  @Get(':propertyReserveId')
  async findOne(
    @Param('propertyReserveId', ParseIntPipe) propertyReserveId: number,
  ): Promise<SuccessResponseArgs> {
    const result = await this.propertyReserveUserService.findOne(propertyReserveId);

    return { result };
  }

  @ApiOperation({ summary: 'Update', description: '' })
  @Put(':propertyReserveId')
  async update(
    @Param('propertyReserveId', ParseIntPipe) propertyReserveId: number,
    @Body() dto: UpdatePropertyReserveUserDto,
  ): Promise<SuccessResponseArgs> {
    await this.propertyReserveUserService.findOne(propertyReserveId);
    const result = await this.propertyReserveUserService.update(propertyReserveId, dto);

    return { result, messageCode: 'UPDATE' };
  }

  // @ApiOperation({ summary: 'Remove', description: '' })
  // @Delete(':propertyReserveId')
  // async remove(@Param('propertyReserveId', ParseIntPipe) propertyReserveId: number): Promise<SuccessResponseArgs> {
  //   await this.propertyReserveUserService.findOne(propertyReserveId);
  //   await this.propertyReserveUserService.remove(propertyReserveId);

  //   return { messageCode: 'DELETE' };
  // }
}
