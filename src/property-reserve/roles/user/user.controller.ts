import { Patch, Post, Query, Req, UseGuards, Version } from '@nestjs/common';
import { Body, Controller, Get, Headers, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RESERVE_CALL_JOB, RESERVE_EXPIRE_JOB } from 'src/property-reserve/processors/queue-name.constants';
import { BadRequestException, ParseIntPipe } from '@nestjs/common';
import { GUEST_RESERVE_VISIBILITY_HOURS } from 'src/property-reserve/common/constants/reserve.constant';
import { RESERVE_QUEUE, RESERVE_SMS_JOB } from 'src/property-reserve/processors/queue-name.constants';
import { FindAllPropertyReserveUserDto } from './dto/find-all.dto';
import { CreatePropertyReserveUserDto } from './dto/create.dto';
import { PropertyReserveUserService } from './user.service';
import { RESERVE_CALL_DELAY_MINUTES } from 'src/property-reserve/common/constants/reserve.constant';
import { RequestType, UserType } from 'src/common/interfaces/user.interface';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { RESERVE_TTL_MINUTES } from 'src/property-reserve/common/constants/reserve.constant';
import { USER_ROUTE_GROUP } from 'src/property-reserve/common/route-group.constant';
import { PropertyReserve } from '@prisma/client';
import { SocketService } from 'src/socket/socket.service';
import { SocketEvents } from 'src/socket/common/socket-event.enum';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { InjectQueue } from '@nestjs/bull';
import { UserRole } from 'src/common/interfaces/role.enum';
import { Queue } from 'bull';

import moment from 'moment-jalaali';

@ApiTags('PropertyReserve - USER')
@UseGuards(UserJwtGuard)
@ApiBearerAuth('user-jwt')
@Controller(USER_ROUTE_GROUP)
export class PropertyReserveUserController {
  constructor(
    @InjectQueue(RESERVE_QUEUE) private readonly queue: Queue,
    private readonly propertyReserveUserService: PropertyReserveUserService,
    private readonly socketService: SocketService,
  ) {}

  private async submit(
    user: UserType,
    dto: CreatePropertyReserveUserDto,
    idempotencyKey?: string,
  ): Promise<{ outcome: 'created' | 'active' | 'replayed'; reserve: PropertyReserve }> {
    const activeReserveId = await this.propertyReserveUserService.checkActiveReserveOnProperty(
      user.id,
      dto.property_id,
    );
    if (activeReserveId) {
      const reserve = await this.propertyReserveUserService.findById(activeReserveId, user.id);
      return { outcome: 'active', reserve };
    }

    await this.propertyReserveUserService.canCreateReserves(user.id);

    const { reserve, ownerId, created } = await this.propertyReserveUserService.create(
      dto,
      user,
      idempotencyKey,
    );
    if (!created) return { outcome: 'replayed', reserve };

    await this.queue.add(RESERVE_SMS_JOB, { reserveId: reserve.id });
    await this.queue.add(
      RESERVE_CALL_JOB,
      { reserveId: reserve.id },
      { delay: RESERVE_CALL_DELAY_MINUTES * 60 * 1000 },
    );

    await this.queue.add(
      RESERVE_EXPIRE_JOB,
      { reserveId: reserve.id },
      { delay: RESERVE_TTL_MINUTES * 60 * 1000 },
    );

    this.socketService.emit(
      [ownerId],
      {
        name: SocketEvents.NEW_RESERVE,
        eventData: null,
        type: 'info',
        title: 'رزرو جدید',
        body: 'یک درخواست رزرو جدی برای شما ثبت شد',
      },
      UserRole.USER,
    );
    return { outcome: 'created', reserve };
  }

  @ApiOperation({ summary: 'Create', description: '' })
  @Post()
  async create(
    @Req() req: RequestType,
    @Body() dto: CreatePropertyReserveUserDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<SuccessResponseArgs> {
    const user = req.user;
    const { outcome, reserve } = await this.submit(user, dto, idempotencyKey);
    if (outcome !== 'active') return;
    const result = await this.propertyReserveUserService.findOne(reserve.id, user.id);
    return { result };
  }

  @Version('2')
  @ApiOperation({
    summary: 'Create V2',
    description: 'Always answers { reserve, created }; created is false for an active or replayed request',
  })
  @Post()
  async createV2(
    @Req() req: RequestType,
    @Body() dto: CreatePropertyReserveUserDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<SuccessResponseArgs> {
    const { outcome, reserve } = await this.submit(req.user, dto, idempotencyKey);
    return {
      result: {
        created: outcome === 'created',
        reserve: {
          id: reserve.id,
          property_id: reserve.property_id,
          check_in: reserve.check_in,
          check_out: reserve.check_out,
          guests_count: reserve.guests_count,
          status: reserve.status,
          created_at: reserve.created_at,
        },
      },
    };
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
    const reserve = await this.propertyReserveUserService.findById(propertyReserveId, user.id);
    const isVisibleForGuest = moment(reserve.created_at)
      .add(GUEST_RESERVE_VISIBILITY_HOURS, 'hours')
      .isAfter(moment());
    if (reserve.canceled_at || !isVisibleForGuest) throw new BadRequestException('RESERVE5');
    const result = await this.propertyReserveUserService.cancel(propertyReserveId);
    return { result, messageCode: 'RESERVE1' };
  }
}
