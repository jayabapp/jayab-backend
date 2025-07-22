import { Controller, ForbiddenException, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { THREE_MINUTES_TTL } from 'src/common/utils/constants/cache-ttl.constant';

@ApiTags('👨‍💻 Dashboard - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ operationId: 'Find all' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(THREE_MINUTES_TTL)
  @Get()
  async findAll(): Promise<SuccessResponseArgs> {
    const result = await this.dashboardService.findAll();
    return { result };
  }

  @ApiOperation({ operationId: 'Find Dashboard for business' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(THREE_MINUTES_TTL)
  @Get('business')
  async findAllForBusiness(): Promise<SuccessResponseArgs> {
    const result = await this.dashboardService.findAllForBusiness();
    return { result };
  }

  @Get('count')
  async findCount(): Promise<SuccessResponseArgs> {
    const result = await this.dashboardService.findCount();
    return { result };
  }

  @ApiOperation({ summary: 'Find Badge For Sidebar' })
  @Get('sidebar-badge')
  async findAllSidebarBadge(): Promise<SuccessResponseArgs> {
    let result;
    result = await this.dashboardService.findAllSidebarBadge();
    return { result };
  }
}
