import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckMobileIsExistClientDto } from './dto/check-mobile.dto';

@Injectable()
export class ClientService {
  constructor(private readonly db: PrismaService) {}

  async checkMobileIsExist(dto: CheckMobileIsExistClientDto): Promise<any> {
    const isExist = await this.db.user.findUnique({ where: { mobile_number: dto.mobile_number } });
    return Boolean(isExist);
  }
}
