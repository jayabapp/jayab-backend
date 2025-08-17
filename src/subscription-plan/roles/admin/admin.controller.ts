import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { ADMIN_ROUTE_GROUP } from 'src/subscription-plan/common/route-group.constant';
import { filterValidator } from 'src/subscription-plan/common/helpers/filter-validator.helper';
import { SubscriptionPlanAdminService } from './admin.service';
import { CreateSubscriptionPlanAdminDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdateSubscriptionPlanAdminDto } from './dto/update.dto';
import { FindAllSubscriptionPlanAdminDto } from './dto/find-all.dto';
import { AccessControlList } from '@prisma/client';
import { UpdatePartialSubscriptionPlanAdminDto } from './dto/update-partial.dto';

@ApiTags('👨‍💻 SubscriptionPlan - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller(ADMIN_ROUTE_GROUP)
export class SubscriptionPlanAdminController {
  constructor(private readonly subscriptionPlanAdminService: SubscriptionPlanAdminService) {}

  /* -------------------------------------------------------------------------- */
  /*                                 MODEL PROPS                                */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;
    const result = await this.subscriptionPlanAdminService.findModelProps(rbac);
    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Create', description: '' })
  @Post()
  async create(@Body() dto: CreateSubscriptionPlanAdminDto): Promise<SuccessResponseArgs> {
    const result = await this.subscriptionPlanAdminService.create(dto);

    return { result, messageCode: 'CREATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllSubscriptionPlanAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const result = await this.subscriptionPlanAdminService.findAll(filterQuery, dto.page, dto.per_page);

    return { result };
  }

  @ApiOperation({ summary: 'Find One', description: '' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.subscriptionPlanAdminService.findOne(id);

    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   UPDATE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Update', description: '' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubscriptionPlanAdminDto,
  ): Promise<SuccessResponseArgs> {
    await this.subscriptionPlanAdminService.findById(id);
    const result = await this.subscriptionPlanAdminService.update(id, dto);

    return { result, messageCode: 'UPDATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                               UPDATE PARTIAL                               */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Update Partial', description: '' })
  @Patch(':id/update-partial')
  async updatePartial(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePartialSubscriptionPlanAdminDto,
  ): Promise<SuccessResponseArgs> {
    await this.subscriptionPlanAdminService.findById(id);
    const result = await this.subscriptionPlanAdminService.updatePartial(id, dto);

    return { result, messageCode: 'UPDATE' };
  }

  @ApiOperation({ summary: 'Delete', description: '' })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    await this.subscriptionPlanAdminService.findById(id);
    await this.subscriptionPlanAdminService.remove(id);
    return { messageCode: 'DELETE' };
  }

  /* --------------------------- USER SUBSCRIPTIONS --------------------------- */
  //  @Post('subscriptions')
  //  findAllUserSubscriptions(@Query('page',ParseIntPipe) page:number,@Body() dto:SearchSubscriptions) {
  //    return this.subscriptionPlansService.findAllUserSubscriptions(page,dto);
  //  }

  //  @Get('subscriptions/:id')
  //  findOneUserSubscriptions(@Param('id',ParseIntPipe) id:number) {
  //    return this.subscriptionPlansService.findOneUserSubscription(id);
  //  }
}
