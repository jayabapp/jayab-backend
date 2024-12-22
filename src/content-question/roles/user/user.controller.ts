import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { USER_ROUTE_GROUP } from 'src/content-question/common/route-group.constant';
import { ContentQuestionUserService } from './user.service';
import { CreateContentQuestionUserDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { FindAllContentQuestionUserDto } from './dto/find-all.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('ContentQuestion - USER')
@Controller(USER_ROUTE_GROUP)
export class ContentQuestionUserController {
  constructor(private readonly contentQuestionUserService: ContentQuestionUserService) {}

  @Throttle({ default: { limit: 2, ttl: 120 } })
  @ApiOperation({ operationId: 'Create', description: '' })
  @Post()
  async create(@Body() dto: CreateContentQuestionUserDto): Promise<SuccessResponseArgs> {
    const result = await this.contentQuestionUserService.create(dto);

    return { result, messageCode: 'CONTENT_QUESTION1' };
  }

  @ApiOperation({ operationId: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllContentQuestionUserDto): Promise<SuccessResponseArgs> {
    const result = await this.contentQuestionUserService.findAll(dto);

    return { result };
  }
}
