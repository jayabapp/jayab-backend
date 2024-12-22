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
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
// import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { USER_ROUTE_GROUP } from 'src/submitted-form/common/route-group.constant';
import { SubmittedFormUserService } from './user.service';
import { CreateSubmittedFormUserDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdateSubmittedFormUserDto } from './dto/update.dto';
import { FindAllSubmittedFormUserDto } from './dto/find-all.dto';
import { Request } from 'express';

@ApiTags('SubmittedForm - USER')
@Controller(USER_ROUTE_GROUP)
export class SubmittedFormUserController {
  constructor(private readonly submittedFormUserService: SubmittedFormUserService) {}

  @ApiOperation({ operationId: 'Create', description: '' })
  @Post()
  async create(@Req() req: Request, @Body() dto: CreateSubmittedFormUserDto): Promise<SuccessResponseArgs> {
    const ipv4: string = req?.clientIp;
    if (!ipv4) throw new Error('IP not found');

    await this.submittedFormUserService.create(dto, ipv4);

    return { messageCode: 'FORM1' };
  }
}
