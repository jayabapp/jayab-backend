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
import { USER_ROUTE_GROUP } from "src/advisor/common/route-group.constant";
import { AdvisorUserService } from "./user.service";
import { CreateAdvisorUserDto } from "./dto/create.dto";
import { SuccessResponseArgs } from "src/common/interceptors/transform.interceptor";
import { UpdateAdvisorUserDto } from "./dto/update.dto";
import { FindAllAdvisorUserDto } from "./dto/find-all.dto";

@ApiTags("Advisor - USER")
// @UseGuards(UserJwtGuard)
// @ApiBearerAuth('user-jwt')
@Controller(USER_ROUTE_GROUP)
export class AdvisorUserController {
  constructor(private readonly advisorUserService: AdvisorUserService) {}

  @ApiOperation({ operationId: "Create", description: "" })
  @Post()
  async create(@Body() dto: CreateAdvisorUserDto): Promise<SuccessResponseArgs> {
    const result = await this.advisorUserService.create(dto);

    return { result, messageCode: "CREATE" };
  }

  @ApiOperation({ operationId: "Find All", description: "" })
  @Get()
  async findAll(
    @Query() dto: FindAllAdvisorUserDto
  ): Promise<SuccessResponseArgs> {
    const result = await this.advisorUserService.findAll(dto);

    return { result };
  }

  @ApiOperation({ operationId: "Find One", description: "" })
  @Get(":advisorId")
  async findOne(
    @Param("advisorId", ParseIntPipe) advisorId: number
  ): Promise<SuccessResponseArgs> {
    const result = await this.advisorUserService.findOne(advisorId);

    return { result };
  }

  @ApiOperation({ operationId: "Update", description: "" })
  @Put(":advisorId")
  async update(
    @Param("advisorId", ParseIntPipe) advisorId: number,
    @Body() dto: UpdateAdvisorUserDto
  ): Promise<SuccessResponseArgs> {
    await this.advisorUserService.findOne(advisorId);
    const result = await this.advisorUserService.update(advisorId, dto);

    return { result, messageCode: "UPDATE" };
  }

  // @ApiOperation({ operationId: 'Remove', description: '' })
  // @Delete(':advisorId')
  // async remove(@Param('advisorId', ParseIntPipe) advisorId: number): Promise<SuccessResponseArgs> {
  //   await this.advisorUserService.findOne(advisorId);
  //   await this.advisorUserService.remove(advisorId);

  //   return { messageCode: 'DELETE' };
  // }
}
