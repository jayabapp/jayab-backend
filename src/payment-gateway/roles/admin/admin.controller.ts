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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { ADMIN_ROUTE_GROUP } from 'src/payment-gateway/common/route-group.constant';
import { filterValidator } from 'src/payment-gateway/common/helpers/filter-validator.helper';
import qs from 'qs';
import { PaymentGatewayAdminService } from './admin.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdatePaymentGatewayAdminDto } from './dto/update.dto';
import { FindAllPaymentGatewayAdminDto } from './dto/find-all.dto';
import { AccessControlList } from '@prisma/client';
import { UpdatePartialPaymentGatewayAdminDto } from './dto/update-partial.dto';

@ApiTags('👨‍💻 PaymentGateway - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller(ADMIN_ROUTE_GROUP)
export class PaymentGatewayAdminController {
  constructor(private readonly paymentGatewayAdminService: PaymentGatewayAdminService) {}

  /* -------------------------------------------------------------------------- */
  /*                                 MODEL PROPS                                */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;
    const result = await this.paymentGatewayAdminService.findModelProps(rbac);
    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllPaymentGatewayAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const result = await this.paymentGatewayAdminService.findAll(filterQuery, dto.page, dto.per_page);

    return { result };
  }

  @ApiOperation({ summary: 'Find One', description: '' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.paymentGatewayAdminService.findById(id);

    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   UPDATE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Update', description: '' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentGatewayAdminDto,
  ): Promise<SuccessResponseArgs> {
    const result = await this.paymentGatewayAdminService.update(id, dto);

    return { result, messageCode: 'UPDATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                               UPDATE PARTIAL                               */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Update Partial', description: '' })
  @Patch(':id/update-partial')
  async updatePartial(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePartialPaymentGatewayAdminDto,
  ): Promise<SuccessResponseArgs> {
    const result = await this.paymentGatewayAdminService.updatePartial(id, dto);

    return { result, messageCode: 'UPDATE' };
  }
}
