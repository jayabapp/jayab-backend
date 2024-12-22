import { Controller, Get, Body, Patch, Param, UseGuards, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { UpdateRobotTxtDto, UpdateSettingDto } from 'src/setting/dto/update-setting.dto';
import { SettingAdminService } from './admin.service';

@ApiTags('👨‍💻 Settings - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller('admin/settings')
export class SettingAdminController {
  constructor(private readonly settingAdminService: SettingAdminService) {}

  @Get()
  async findAll(): Promise<SuccessResponseArgs> {
    const result = await this.settingAdminService.findAll();
    return { result: result };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSettingDto): Promise<SuccessResponseArgs> {
    await this.settingAdminService.update(+id, dto);
    return { messageCode: 'COMMON4' };
  }

  @ApiOperation({ operationId: 'Update robot.txt' })
  @Post('robot')
  async updateRobot(@Body() dto: UpdateRobotTxtDto): Promise<SuccessResponseArgs> {
    await this.settingAdminService.updateRobot(dto);
    return { messageCode: 'COMMON4' };
  }

  @ApiOperation({ operationId: 'Update ' })
  @Post('sitemap')
  async updateSitemap(): Promise<SuccessResponseArgs> {
    const result = await this.settingAdminService.generateSitemap();
    return { result, messageCode: 'COMMON4' };
  }
}
