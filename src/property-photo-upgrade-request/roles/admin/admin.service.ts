import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, Prisma, PropertyPhotoUpgradeRequest } from '@prisma/client';
import { type PaginatedResult, paginate } from 'src/common/helpers/paginator';
import {
  CreateProps,
  OperatorItems,
  ShowAction,
  ShowProps,
  TableProps,
} from 'src/common/interfaces/model-props.interface';
import { operatorsList } from 'src/common/utils/constants/filter-operators.constant';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  PropertyPhotoUpgradeRequestItemStatus,
  PropertyPhotoUpgradeRequestItemStatusesList,
  PropertyPhotoUpgradeRequestStatus,
  PropertyPhotoUpgradeRequestStatusesList,
} from 'src/property/common/types/property-photo-upgrade-status.type';
import {
  allActionsBuilder,
  createPropsBuilder,
  filterPropsBuilder,
  showActionBuilder,
  showPropsBuilder,
  tablePropsBuilder,
} from 'src/property-photo-upgrade-request/common/helpers/model-props-builder.helper';
import { UpdatePropertyPhotoUpgradeRequestItemAdminDto } from './dto/update-item.dto';

@Injectable()
export class PropertyPhotoUpgradeRequestAdminService {
  constructor(private readonly db: PrismaService) {}

  async findAll(
    filters: Prisma.PropertyPhotoUpgradeRequestWhereInput,
    page: number,
    perPage = 50,
  ): Promise<PaginatedResult<PropertyPhotoUpgradeRequest>> {
    const list = await paginate()<any, Prisma.PropertyPhotoUpgradeRequestFindManyArgs>(
      this.db.propertyPhotoUpgradeRequest,
      {
        where: filters,
        include: {
          property: { select: { id: true, title: true, code: true } },
          owner: { select: { id: true, user: { select: { full_name: true, mobile_number: true } } } },
          payment: { select: { id: true, amount: true, status: true, ref_id: true } },
          _count: { select: { items: true } },
        },
        orderBy: { created_at: 'desc' },
      },
      { page, perPage },
    );

    list.data = list.data.map((item) => ({
      ...item,
      status_title: PropertyPhotoUpgradeRequestStatusesList.find((e) => e.id === item.status)?.title,
      owner: {
        ...item.owner,
        full_name: item.owner?.user?.full_name,
        mobile_number: item.owner?.user?.mobile_number,
      },
    }));

    return list;
  }

  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[]; item: any }> {
    const item = await this.db.propertyPhotoUpgradeRequest.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            code: true,
            temp_attachments: {
              select: {
                id: true,
                name: true,
                thumbnail: true,
                path: true,
                medium: true,
                bucket: true,
                end_point: true,
                alt: true,
              },
            },
          },
        },
        owner: { select: { id: true, user: { select: { full_name: true, mobile_number: true } } } },
        payment: { select: { id: true, amount: true, status: true, ref_id: true } },
        subscription: { select: { id: true, title: true, status: true } },
        items: {
          include: {
            attachment: {
              select: {
                id: true,
                name: true,
                thumbnail: true,
                path: true,
                medium: true,
                bucket: true,
                end_point: true,
                alt: true,
              },
            },
            original_attachment: {
              select: {
                id: true,
                name: true,
                thumbnail: true,
                path: true,
                medium: true,
                bucket: true,
                end_point: true,
                alt: true,
              },
            },
            edited_by_admin: { select: { id: true, full_name: true } },
          },
          orderBy: { id: 'asc' },
        },
      },
    });
    if (!item) throw new NotFoundException('NOT_FOUND');

    const serialized = {
      ...item,
      status_title: PropertyPhotoUpgradeRequestStatusesList.find((e) => e.id === item.status)?.title,
      owner: {
        ...item.owner,
        full_name: item.owner?.user?.full_name,
        mobile_number: item.owner?.user?.mobile_number,
      },
      items: item.items.map((requestItem) => ({
        ...requestItem,
        status_title: PropertyPhotoUpgradeRequestItemStatusesList.find((e) => e.id === requestItem.status)
          ?.title,
        is_edited: requestItem.status === PropertyPhotoUpgradeRequestItemStatus.EDITED,
        current_attachment: requestItem.attachment,
        previous_attachment: requestItem.original_attachment,
      })),
    };

    const showProps = showPropsBuilder(serialized);
    const actions = showActionBuilder(item);

    return { showProps, actions, item: serialized };
  }

  async findById(id: number): Promise<PropertyPhotoUpgradeRequest> {
    const item = await this.db.propertyPhotoUpgradeRequest.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
  }

  async updateRequestItem(
    adminId: number,
    requestId: number,
    itemId: number,
    dto: UpdatePropertyPhotoUpgradeRequestItemAdminDto,
  ): Promise<{ showProps: ShowProps[]; actions?: ShowAction[]; item: any }> {
    const request = await this.db.propertyPhotoUpgradeRequest.findUnique({
      where: { id: requestId },
      select: { id: true, status: true, property_id: true },
    });
    if (!request) throw new NotFoundException('NOT_FOUND');
    if (request.status === PropertyPhotoUpgradeRequestStatus.WAITING_PAYMENT)
      throw new BadRequestException('PROPERTY_PHOTO_UPGRADE_PAYMENT_PENDING');

    const requestItem = await this.db.propertyPhotoUpgradeRequestItem.findFirst({
      where: { id: itemId, request_id: requestId },
      select: { id: true, attachment_id: true, original_attachment_id: true },
    });
    if (!requestItem) throw new NotFoundException('NOT_FOUND');

    if (dto.attachment_id) {
      const attachment = await this.db.attachment.findUnique({
        where: { id: dto.attachment_id },
        select: { id: true },
      });
      if (!attachment) throw new NotFoundException('ATTACHMENT_NOT_FOUND');
    }

    await this.db.$transaction(async (tx) => {
      await tx.propertyPhotoUpgradeRequestItem.update({
        where: { id: itemId },
        data: dto.attachment_id
          ? {
              attachment_id: dto.attachment_id,
              original_attachment_id: requestItem.original_attachment_id || requestItem.attachment_id,
              status: PropertyPhotoUpgradeRequestItemStatus.EDITED,
              edited_at: new Date(),
              edited_by_admin_id: adminId,
            }
          : dto.is_edited
          ? {
              status: PropertyPhotoUpgradeRequestItemStatus.EDITED,
              edited_at: new Date(),
              edited_by_admin_id: adminId,
            }
          : {
              status: PropertyPhotoUpgradeRequestItemStatus.PENDING,
              edited_at: null,
              edited_by_admin_id: null,
            },
      });

      if (dto.attachment_id && requestItem.attachment_id !== dto.attachment_id) {
        await tx.propertyImage.updateMany({
          where: {
            property_id: request.property_id,
            attachment_id: requestItem.attachment_id,
          },
          data: { attachment_id: dto.attachment_id },
        });

        await tx.property.update({
          where: { id: request.property_id },
          data: {
            temp_attachments: {
              connect: { id: requestItem.attachment_id },
              disconnect: { id: dto.attachment_id },
            },
          },
        });
      }

      const items = await tx.propertyPhotoUpgradeRequestItem.findMany({
        where: { request_id: requestId },
        select: { status: true },
      });
      const editedCount = items.filter(
        (item) => item.status === PropertyPhotoUpgradeRequestItemStatus.EDITED,
      ).length;

      const status =
        editedCount === 0
          ? PropertyPhotoUpgradeRequestStatus.PENDING
          : editedCount === items.length
            ? PropertyPhotoUpgradeRequestStatus.COMPLETED
            : PropertyPhotoUpgradeRequestStatus.IN_PROGRESS;

      await tx.propertyPhotoUpgradeRequest.update({
        where: { id: requestId },
        data: {
          status,
          completed_at: status === PropertyPhotoUpgradeRequestStatus.COMPLETED ? new Date() : null,
        },
      });
    });

    return this.findOne(requestId);
  }

  async findModelProps(rbac: AccessControlList): Promise<{
    filterProps: Array<CreateProps>;
    createProps: Array<CreateProps>;
    tableProps: TableProps;
    operators: Array<OperatorItems>;
  }> {
    const availableActions = allActionsBuilder(rbac);
    const filterProps = filterPropsBuilder();
    const tableProps = tablePropsBuilder(availableActions);
    const createProps = createPropsBuilder();

    return { operators: operatorsList, filterProps, createProps, tableProps };
  }
}
