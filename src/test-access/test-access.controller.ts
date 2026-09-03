import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CreateTestAccessMemberDto } from './dto/create-test-access-member.dto';
import { UpdateTestAccessMemberDto } from './dto/update-test-access-member.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { TestAccessService } from './test-access.service';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { RequestType } from 'src/common/interfaces/user.interface';

@ApiTags('Test access')
@ApiBearerAuth('user-jwt')
@UseGuards(UserJwtGuard)
@Controller('user/test-access')
export class TestAccessController {
  constructor(private readonly testAccessService: TestAccessService) {}

  @Get('me')
  async me(@Req() request: RequestType): Promise<SuccessResponseArgs> {
    return {
      result: {
        enabled: this.testAccessService.isEnabled(),
        is_team_lead: await this.testAccessService.isTeamLead(request.user.mobile_number),
      },
    };
  }

  @Get('members')
  async list(@Req() request: RequestType): Promise<SuccessResponseArgs> {
    return {
      result: await this.testAccessService.list(request.user.mobile_number),
    };
  }

  @Post('members')
  async create(
    @Req() request: RequestType,
    @Body() dto: CreateTestAccessMemberDto,
  ): Promise<SuccessResponseArgs> {
    return {
      result: await this.testAccessService.create(dto.mobile_number, request.user.mobile_number),
    };
  }

  @Patch('members/:id')
  async setActive(
    @Req() request: RequestType,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTestAccessMemberDto,
  ): Promise<SuccessResponseArgs> {
    return {
      result: await this.testAccessService.setActive(id, dto.is_active, request.user.mobile_number),
    };
  }
}
