import { Controller, ForbiddenException, Get, Headers, Query, Req } from '@nestjs/common';
import { ClientService } from './client.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { Request } from 'express';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CheckMobileIsExistClientDto } from './dto/check-mobile.dto';
import { ConfigService } from '@nestjs/config';

@ApiTags('🔐 Client')
@Controller('client')
export class ClientController {
  constructor(
    private readonly clientService: ClientService,
    private readonly config: ConfigService,
  ) {}

  @ApiOperation({ summary: 'Check Mobile Is Exist', description: '' })
  @ApiHeader({ name: 'x-api-key', required: true })
  @Get('mobile-exists')
  async checkMobileIsExist(
    @Req() req: Request,
    @Headers() headers: Headers,
    @Query() dto: CheckMobileIsExistClientDto,
  ): Promise<SuccessResponseArgs> {
    //x-api-key
    const xApiKey: string = headers['x-api-key'];
    if (!xApiKey || xApiKey !== this.config.get('client.client1.xApiKey'))
      throw new ForbiddenException('CLIENT1');

    const ip = req.ip;
    console.log({ ip });
    if (ip !== this.config.get('client.client1.ip')) throw new ForbiddenException('CLIENT2');

    const isExist = await this.clientService.checkMobileIsExist(dto);

    return { result: { is_exist: isExist } };
  }
}
