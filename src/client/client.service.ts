import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyStatuses } from 'src/property/common/types/property-status.type';
import { CheckMobileIsExistClientDto } from './dto/check-mobile.dto';

@Injectable()
export class ClientService {
  constructor(private readonly db: PrismaService) {}

  async checkMobileIsExist(dto: CheckMobileIsExistClientDto): Promise<boolean> {
    const owner = await this.db.owner.findFirst({
      where: {
        user: { mobile_number: dto.mobile_number },
        properties: {
          some: {
            status: {
              in: [PropertyStatuses.WAITING, PropertyStatuses.PUBLISHED],
            },
          },
        },
      },
      select: { id: true },
    });

    const isExist = Boolean(owner);
    return isExist;
  }
}
