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
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
// import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { USER_ROUTE_GROUP } from "src/owner/common/route-group.constant";
import { OwnerUserService } from "./user.service";
import { CreateOwnerUserDto } from "./dto/create.dto";
import { SuccessResponseArgs } from "src/common/interceptors/transform.interceptor";
import { UpdateOwnerUserDto } from "./dto/update.dto";
import { FindAllOwnerUserDto } from "./dto/find-all.dto";

@ApiTags("Owner - USER")
// @UseGuards(UserJwtGuard)
// @ApiBearerAuth('user-jwt')
@Controller(USER_ROUTE_GROUP)
export class OwnerUserController {
  constructor(private readonly ownerUserService: OwnerUserService) {}

  @ApiOperation({ operationId: "Create", description: "" })
  @Post()
  async create(@Body() dto: CreateOwnerUserDto): Promise<SuccessResponseArgs> {
    const result = await this.ownerUserService.create(dto);

    return { result, messageCode: "CREATE" };
  }

  @ApiOperation({ operationId: "Find All", description: "" })
  @Get()
  async findAll(
    @Query() dto: FindAllOwnerUserDto
  ): Promise<SuccessResponseArgs> {
    const result = await this.ownerUserService.findAll(dto);

    return { result };
  }

  @ApiOperation({ operationId: "Find One", description: "" })
  @Get(":ownerId")
  async findOne(
    @Param("ownerId", ParseIntPipe) ownerId: number
  ): Promise<SuccessResponseArgs> {
    const result = await this.ownerUserService.findOne(ownerId);

    return { result };
  }

  @ApiOperation({ operationId: "Update", description: "" })
  @Put(":ownerId")
  async update(
    @Param("ownerId", ParseIntPipe) ownerId: number,
    @Body() dto: UpdateOwnerUserDto
  ): Promise<SuccessResponseArgs> {
    await this.ownerUserService.findOne(ownerId);
    const result = await this.ownerUserService.update(ownerId, dto);

    return { result, messageCode: "UPDATE" };
  }

  // @ApiOperation({ operationId: 'Remove', description: '' })
  // @Delete(':ownerId')
  // async remove(@Param('ownerId', ParseIntPipe) ownerId: number): Promise<SuccessResponseArgs> {
  //   await this.ownerUserService.findOne(ownerId);
  //   await this.ownerUserService.remove(ownerId);

  //   return { messageCode: 'DELETE' };
  // }
}
