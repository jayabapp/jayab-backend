import { Body, Controller, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { OwnerUpdatePropertyInterceptor } from 'src/property/common/interceptors/owner-property.interceptor';
import { PropertyCalendarOwnerService } from './owner.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { OWNER_ROUTE_GROUP } from 'src/property-calendar/common/route-group.constant';
import { JalaaliDateDto } from 'src/common/dto/jalaali-date.dto';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { OwnerGuard } from 'src/auth/guards/owner.guard';
import {
  BulkUpdatePropertyDayPriceOwnerDto,
  BulkUpdatePropertyReservedStatusOwnerDto,
  CreatePropertyCalendarNoteOwnerDto,
  UpdatePropertyAdvisorCommissionOwnerDto,
  UpdatePropertyDayPriceOwnerDto,
  UpdatePropertyReservedStatusOwnerDto,
} from './dto/create.dto';

@ApiTags('PropertyCalendar - OWNER')
@UseGuards(UserJwtGuard, OwnerGuard)
@UseInterceptors(OwnerUpdatePropertyInterceptor)
@ApiBearerAuth('user-jwt')
@Controller(OWNER_ROUTE_GROUP)
export class PropertyCalendarOwnerController {
  constructor(private readonly propertyCalendarOwnerService: PropertyCalendarOwnerService) {}

  /* ---------------------------------- NOTE ---------------------------------- */
  @ApiOperation({ summary: 'Upser Note', description: '' })
  @Post('notes')
  async upsertNote(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: CreatePropertyCalendarNoteOwnerDto,
  ): Promise<SuccessResponseArgs> {
    const result = await this.propertyCalendarOwnerService.upsertNote(propertyId, dto);

    return { result };
  }

  /* --------------------------------- RESERVE -------------------------------- */
  @ApiOperation({ summary: 'Update Reserve Status', description: '' })
  @Post('reserves')
  async createReserveDay(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: UpdatePropertyReservedStatusOwnerDto,
  ): Promise<SuccessResponseArgs> {
    const result = await this.propertyCalendarOwnerService.updateReserveStatus(propertyId, dto);

    return { result };
  }

  @ApiOperation({ summary: 'Update Reserve Status Of Many Days', description: '' })
  @Post('reserves/bulk')
  async createReserveDays(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: BulkUpdatePropertyReservedStatusOwnerDto,
  ): Promise<SuccessResponseArgs> {
    const result = await this.propertyCalendarOwnerService.bulkUpdateReserveStatus(propertyId, dto);

    return { result };
  }

  /* ------------------------------- COMMISSION ------------------------------- */
  @ApiOperation({ summary: 'Update Advisor Commission', description: '' })
  @Post('commission')
  async updateAdvisorCommission(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: UpdatePropertyAdvisorCommissionOwnerDto,
  ): Promise<SuccessResponseArgs> {
    const result = await this.propertyCalendarOwnerService.updateAdvisorCommission(propertyId, dto);

    return { result };
  }

  @ApiOperation({ summary: 'Acceptable Price Range', description: '' })
  @Get('price')
  async findAcceptablePriceRange(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Query() dto: JalaaliDateDto,
  ): Promise<SuccessResponseArgs> {
    const result = await this.propertyCalendarOwnerService.findAcceptablePriceRange(propertyId, dto);

    return { result };
  }

  @ApiOperation({ summary: 'Update Price', description: '' })
  @Post('price')
  async updatePrice(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: UpdatePropertyDayPriceOwnerDto,
  ): Promise<SuccessResponseArgs> {
    const result = await this.propertyCalendarOwnerService.updatePrice(propertyId, dto);

    return { result };
  }

  @ApiOperation({ summary: 'Update Price Of Many Days', description: '' })
  @Post('price/bulk')
  async updatePrices(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: BulkUpdatePropertyDayPriceOwnerDto,
  ): Promise<SuccessResponseArgs> {
    const result = await this.propertyCalendarOwnerService.bulkUpdatePrice(propertyId, dto);

    return { result };
  }

  @ApiOperation({ summary: 'Find All', description: 'Find one too, with an optional query' })
  @ApiQuery({ name: 'day', required: false, type: Number })
  @Get()
  async findAll(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('day') day?: number,
  ): Promise<SuccessResponseArgs> {
    const result = await this.propertyCalendarOwnerService.findAll(propertyId, year, month, +day);

    return { result };
  }
}
