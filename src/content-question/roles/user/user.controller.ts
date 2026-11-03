import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { FindAllContentQuestionUserDto } from './dto/find-all.dto';
import { CreateContentQuestionUserDto } from './dto/create.dto';
import { ContentQuestionUserService } from './user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { USER_ROUTE_GROUP } from 'src/content-question/common/route-group.constant';
import { ONE_MINUTE_TTL } from 'src/common/utils/constants/cache-ttl.constant';
import { Throttle } from '@nestjs/throttler';

@ApiTags('ContentQuestion - USER')
@Controller(USER_ROUTE_GROUP)
export class ContentQuestionUserController {
  constructor(private readonly contentQuestionUserService: ContentQuestionUserService) {}

  @Throttle({ default: { limit: 4, ttl: ONE_MINUTE_TTL } })
  @ApiOperation({ summary: 'Create', description: '', operationId: 'contentQuestionUserCreate' })
  @Post()
  async create(@Body() dto: CreateContentQuestionUserDto): Promise<SuccessResponseArgs> {
    const result = await this.contentQuestionUserService.create(dto);
    return { result, messageCode: 'CONTENT_QUESTION1' };
  }

  @ApiOperation({ summary: 'Find All', description: '', operationId: 'contentQuestionUserFindAll' })
  @Get()
  async findAll(@Query() dto: FindAllContentQuestionUserDto): Promise<SuccessResponseArgs> {
    const result = await this.contentQuestionUserService.findAll(dto);
    return { result };
  }

  @ApiOperation({ summary: 'Rate', description: '', operationId: 'contentQuestionUserCalculateRate' })
  @Get('rate')
  async calculateRate(@Query() dto: FindAllContentQuestionUserDto): Promise<SuccessResponseArgs> {
    const result = await this.contentQuestionUserService.calculateRate(dto);
    return { result };
  }
}
