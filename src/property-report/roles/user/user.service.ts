import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyStatuses } from 'src/property/common/types/property-status.type';
import { CreatePropertyReportUserDto } from './dto/create.dto';

@Injectable()
export class PropertyReportUserService {
  constructor(private readonly db: PrismaService) {}

  /**
   * create
   * @param propertyId
   * @param userId
   * @param dto
   */
  async create(userId: number, propertyId: number, dto: CreatePropertyReportUserDto): Promise<void> {
    const property = await this.db.property.findFirst({
      where: { id: propertyId, status: PropertyStatuses.PUBLISHED },
      include: { reports: { where: { user_id: userId } } },
    });

    if (!property) throw new NotFoundException('NOT_FOUND_POST');

    if (property.reports.find((e) => e.user_id === userId)) throw new BadRequestException('REPORT1');

    await this.db.propertyReport.create({ data: { user_id: userId, property_id: propertyId, ...dto } });
  }
}
