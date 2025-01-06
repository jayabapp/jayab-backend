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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
// import { OwnerJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { OWNER_ROUTE_GROUP } from 'src/property-calendar-note/common/route-group.constant';
import { PropertyCalendarNoteOwnerService } from './owner.service';
import { CreatePropertyCalendarNoteOwnerDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdatePropertyCalendarNoteOwnerDto } from './dto/update.dto';
import { FindAllPropertyCalendarNoteOwnerDto } from './dto/find-all.dto';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { OwnerGuard } from 'src/auth/guards/owner.guard';
import { OwnerUpdatePropertyInterceptor } from 'src/property/common/interceptors/owner-property.interceptor';

@ApiTags('PropertyCalendarNote - OWNER')
@UseGuards(UserJwtGuard, OwnerGuard)
@UseInterceptors(OwnerUpdatePropertyInterceptor)
@ApiBearerAuth('user-jwt')
@Controller(OWNER_ROUTE_GROUP)
export class PropertyCalendarNoteOwnerController {
  constructor(private readonly propertyCalendarNoteOwnerService: PropertyCalendarNoteOwnerService) {}

  @ApiOperation({ operationId: 'Create', description: '' })
  @Post()
  async create(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: CreatePropertyCalendarNoteOwnerDto,
  ): Promise<SuccessResponseArgs> {
    await this.propertyCalendarNoteOwnerService.create(propertyId, dto);

    return;
  }
}
