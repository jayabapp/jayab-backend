import { PropertyPhotoUpgradeRequestItemStatusesList } from 'src/property/common/types/property-photo-upgrade-status.type';
import { FindAllPropertyPhotoUpgradeRequestOwnerDto } from './dto/find-all.dto';
import { PropertyPhotoUpgradeRequestStatusesList } from 'src/property/common/types/property-photo-upgrade-status.type';
import { PropertyPhotoUpgradeRequestItemStatus } from 'src/property/common/types/property-photo-upgrade-status.type';
import { Prisma, PropertyPhotoUpgradeRequest } from '@prisma/client';
import { PropertyPhotoUpgradeRequestStatus } from 'src/property/common/types/property-photo-upgrade-status.type';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PropertyPhotoUpgradeRequestOwnerService {
  constructor(private readonly db: PrismaService) {}

  async findAll(
    ownerId: number,
    dto: FindAllPropertyPhotoUpgradeRequestOwnerDto,
  ): Promise<PropertyPhotoUpgradeRequest[]> {
    const q: Prisma.PropertyPhotoUpgradeRequestWhereInput = {
      owner_id: ownerId,
      status: { gt: PropertyPhotoUpgradeRequestStatus.WAITING_PAYMENT },
    };

    const list = await this.db.propertyPhotoUpgradeRequest.findMany({
      where: q,
      include: {
        property: { select: { id: true, title: true, code: true, feature_image: true } },
        _count: { select: { items: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    //@ts-ignore
    return list.map((item) => ({
      ...item,
      status: PropertyPhotoUpgradeRequestStatusesList.find((status) => status.id === item.status),
    }));
  }

  async findOne(ownerId: number, id: number): Promise<any> {
    const item = await this.db.propertyPhotoUpgradeRequest.findFirst({
      where: {
        id,
        owner_id: ownerId,
        status: { gt: PropertyPhotoUpgradeRequestStatus.WAITING_PAYMENT },
      },
      include: {
        property: { select: { id: true, title: true, code: true, feature_image: true } },
        subscription: { select: { id: true, title: true, status: true } },
        items: {
          include: {
            attachment: true,
            original_attachment: true,
            edited_by_admin: { select: { id: true, full_name: true } },
          },
          orderBy: { id: 'asc' },
        },
      },
    });
    if (!item) throw new NotFoundException('NOT_FOUND');

    return {
      ...item,
      status: PropertyPhotoUpgradeRequestStatusesList.find((status) => status.id === item.status),
      items: item.items.map((requestItem) => ({
        ...requestItem,
        status_title: PropertyPhotoUpgradeRequestItemStatusesList.find(
          (status) => status.id === requestItem.status,
        )?.title,
        is_edited: requestItem.status === PropertyPhotoUpgradeRequestItemStatus.EDITED,
        current_attachment: requestItem.attachment,
        previous_attachment: requestItem.original_attachment,
      })),
    };
  }
}
