import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PropertyAuthorize, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePropertyAuthorizeOwnerDto } from './dto/create.dto';
import { UpdatePropertyAuthorizeOwnerDto } from './dto/update.dto';
import { FindAllPropertyAuthorizeOwnerDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import { CommonStatuses } from 'src/common/interfaces/common-status.interface';
import {
  PropertyAuthorizeStatuses,
  PropertyAuthorizeStatusesList,
} from 'src/property-authorize/common/property-authorize-status.type';
import { EnumList } from 'src/common/interfaces/model-props.interface';

@Injectable()
export class PropertyAuthorizeOwnerService {
  constructor(private readonly db: PrismaService) {}

  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreatePropertyAuthorizeOwnerDto): Promise<PropertyAuthorize> {
    const newPropertyAuthorize = await this.db.propertyAuthorize.create({
      data: {
        nc_image_id: dto.nc_image_id,
        property_id: dto.property_id,
        status: PropertyAuthorizeStatuses.PENDING,
        docs: { connect: dto.docs?.map((e) => ({ id: +e })) },
      },
    });
    return newPropertyAuthorize;
  }

  /**
   * find all PropertyAuthorize
   * @param dto
   * @returns
   */
  async findAll(dto: FindAllPropertyAuthorizeOwnerDto): Promise<CursorPaginatedResult<PropertyAuthorize>> {
    const list = await cursorPaginate()<PropertyAuthorize, Prisma.PropertyAuthorizeFindManyArgs>(
      this.db.propertyAuthorize,
      {},
      { cursor: dto.cursor },
    );

    return list;
  }

  /**
   * find one PropertyAuthorize by propertyId
   * @param propertyAuthorizeId
   * @returns
   */
  async findOne(propertyId: number, ownerId: number): Promise<Partial<PropertyAuthorize>> {
    const item = await this.db.propertyAuthorize.findFirst({
      where: { property_id: propertyId },
      include: { property: { select: { owner_id: true } }, nc_image: true, docs: true },
      omit: { changelog: true },
    });

    // if (!item) throw new NotFoundException('NOT_FOUND');
    if (item && item.property.owner_id !== ownerId) throw new ForbiddenException('PROPERTY_AUTH2');

    return item;
  }

  /**
   * update
   * @param propertyAuthorizeId
   * @param dto
   * @returns
   */
  async update(propertyId: number, dto: UpdatePropertyAuthorizeOwnerDto): Promise<PropertyAuthorize> {
    const item = await this.db.propertyAuthorize.update({
      where: { property_id: propertyId },
      data: {
        nc_image_id: dto.nc_image_id,
        status: PropertyAuthorizeStatuses.PENDING,
        docs: { set: [], connect: dto.docs?.map((e) => ({ id: +e })) },
      },
    });

    return item;
  }
}
