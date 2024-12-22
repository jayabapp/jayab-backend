import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { AdminReportDto } from './dto/admin-report.dto';

@ApiTags('👨‍💻 Report - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller('admin/admin-report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @ApiOperation({ operationId: 'Sale' })
  @Post('sale')
  async findSaleReport(@Body() dto: AdminReportDto): Promise<SuccessResponseArgs> {
    return {};
  }

  @ApiOperation({ operationId: 'Commission' })
  @Post('commission')
  async findCommissionReport(@Body() dto: AdminReportDto): Promise<SuccessResponseArgs> {
    // const bId = businessId ?? dto.business_id;

    // const result = await this.reportService.findCommissionReport(dto, bId);
    // return { result };
    return;
  }

  // @ApiOperation({ operationId: 'Find all' })
  // @Post()
  // async findAll(
  //   @Body() dto: AdminReportDto,
  //   @Query() queryParams: PaginationDto,
  // ): Promise<SuccessResponseArgs> {
  //   const result = await this.reportService.findAll(dto, queryParams);
  //   return { result };
  // }
}
