import { Controller, Get, Body, Patch, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { UpdateSettingDto } from 'src/setting/dto/update-setting.dto';
import { SettingAdminService } from '../admin/admin.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ONE_MINUTE_TTL } from 'src/common/utils/constants/cache-ttl.constant';
import { Throttle } from '@nestjs/throttler';

@ApiTags('👨‍💻 Settings - SHARED')
@Controller('settings')
export class SettingSharedController {
  constructor(private readonly settingAdminService: SettingAdminService) {}

  @ApiOperation({ summary: 'Find robots.txt' })
  @Get('robots')
  async findRobot(): Promise<SuccessResponseArgs> {
    const result = await this.settingAdminService.findRobot();
    return { result: result };
  }

  @ApiOperation({ summary: 'Find llms.txt' })
  @Get('llms')
  async findLlms(): Promise<SuccessResponseArgs> {
    const result = await this.settingAdminService.findLlms();
    return { result: result };
  }

  @Throttle({ default: { limit: 3, ttl: 15000 } })
  @ApiOperation({ summary: 'Find sitemap.xml' })
  @Get('sitemap')
  async findSitemap(): Promise<SuccessResponseArgs> {
    const result = await this.settingAdminService.generateSitemap();
    return { result: result };
  }
}
