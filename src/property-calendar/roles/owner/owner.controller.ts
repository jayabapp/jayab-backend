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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
// import { OwnerJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { OWNER_ROUTE_GROUP } from 'src/property-calendar/common/route-group.constant';
import { PropertyCalendarOwnerService } from './owner.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdatePropertyCalendarOwnerDto } from './dto/update.dto';
import { FindAllPropertyCalendarOwnerDto } from './dto/find-all.dto';
import { OwnerGuard } from 'src/auth/guards/owner.guard';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { OwnerUpdatePropertyInterceptor } from 'src/property/common/interceptors/owner-property.interceptor';
import {
  CreatePropertyCalendarNoteOwnerDto,
  UpdatePropertyAdvisorCommissionOwnerDto,
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
  @ApiOperation({ operationId: 'Upser Note', description: '' })
  @Post('notes')
  async upsertNote(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: CreatePropertyCalendarNoteOwnerDto,
  ): Promise<SuccessResponseArgs> {
    const result = await this.propertyCalendarOwnerService.upsertNote(propertyId, dto);

    return { result };
  }

  /* --------------------------------- RESERVE -------------------------------- */
  @ApiOperation({ operationId: 'Update Reserve Status', description: '' })
  @Post('reserves')
  async createReserveDay(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: UpdatePropertyReservedStatusOwnerDto,
  ): Promise<SuccessResponseArgs> {
    const result = await this.propertyCalendarOwnerService.updateReserveStatus(propertyId, dto);

    return { result };
  }

  /* ------------------------------- COMMISSION ------------------------------- */
  @ApiOperation({ operationId: 'Update Advisor Commission', description: '' })
  @Post('commission')
  async updateAdvisorCommission(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: UpdatePropertyAdvisorCommissionOwnerDto,
  ): Promise<SuccessResponseArgs> {
    const result = await this.propertyCalendarOwnerService.updateAdvisorCommission(propertyId, dto);

    return { result };
  }

  @ApiOperation({ operationId: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllPropertyCalendarOwnerDto): Promise<SuccessResponseArgs> {
    const result = await this.propertyCalendarOwnerService.findAll(dto);

    return { result };
  }

  @ApiOperation({ operationId: 'Find One', description: '' })
  @Get(':propertyCalendarId')
  async findOne(
    @Param('propertyCalendarId', ParseIntPipe) propertyCalendarId: number,
  ): Promise<SuccessResponseArgs> {
    const result = await this.propertyCalendarOwnerService.findOne(propertyCalendarId);

    return { result };
  }

  @ApiOperation({ operationId: 'Update', description: '' })
  @Put(':propertyCalendarId')
  async update(
    @Param('propertyCalendarId', ParseIntPipe) propertyCalendarId: number,
    @Body() dto: UpdatePropertyCalendarOwnerDto,
  ): Promise<SuccessResponseArgs> {
    await this.propertyCalendarOwnerService.findOne(propertyCalendarId);
    const result = await this.propertyCalendarOwnerService.update(propertyCalendarId, dto);

    return { result, messageCode: 'UPDATE' };
  }

  // @ApiOperation({ operationId: 'Remove', description: '' })
  // @Delete(':propertyCalendarId')
  // async remove(@Param('propertyCalendarId', ParseIntPipe) propertyCalendarId: number): Promise<SuccessResponseArgs> {
  //   await this.propertyCalendarOwnerService.findOne(propertyCalendarId);
  //   await this.propertyCalendarOwnerService.remove(propertyCalendarId);

  //   return { messageCode: 'DELETE' };
  // }
}
