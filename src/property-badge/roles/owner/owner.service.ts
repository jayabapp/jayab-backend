import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PropertyBadge, Prisma, Property } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePropertyBadgeOwnerDto } from './dto/create.dto';
import { UpdatePropertyBadgeOwnerDto } from './dto/update.dto';
import { FindAllPropertyBadgeOwnerDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import {
  PropertyBadgeStatus,
  PropertyBadgeStatusList,
} from 'src/property-badge/common/property-badge-status.type';

@Injectable()
export class PropertyBadgeOwnerService {
  constructor(private readonly db: PrismaService) {}

  /**
   * create
   * @param dto
   * @returns
   */
  async create(propertyId: number): Promise<PropertyBadge & { property: Partial<Property> }> {
    const badge = await this.db.propertyBadge.findFirst({ where: { property_id: propertyId } });

    if (!!badge) throw new BadRequestException('PROPERTY_BADGE2');

    const newPropertyBadge = await this.db.propertyBadge.create({
      data: { property_id: propertyId, status: PropertyBadgeStatus.PENDING },
      include: { property: { select: { title: true } } },
    });
    return newPropertyBadge;
  }

  /**
   * find one propertyBadge
   * @param propertyBadgeId
   * @returns
   */
  async findOne(propertyId: number): Promise<any> {
    const item = await this.db.propertyBadge.findFirst({
      where: { property_id: propertyId },
      omit: { changelog: true },
    });

    if (!item) return null;

    return { ...item, status: PropertyBadgeStatusList.find((e) => e.id === item.status) };
  }
}
