import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PropertyAuthorize, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePropertyAuthorizeOwnerDto } from './dto/create.dto';
import { UpdatePropertyAuthorizeOwnerDto } from './dto/update.dto';
import { FindAllPropertyAuthorizeOwnerDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import { CommonStatuses } from 'src/common/interfaces/common-status.interface';
import { PropertyAuthorizeStatuses } from 'src/property-authorize/common/property-authorize-status.type';

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
   * find one PropertyAuthorize
   * @param propertyAuthorizeId
   * @returns
   */
  async findOne(propertyAuthorizeId: number, ownerId: number): Promise<PropertyAuthorize> {
    const item = await this.db.propertyAuthorize.findFirst({
      where: { id: propertyAuthorizeId },
      include: { property: { select: { owner_id: true } } },
    });

    if (!item) throw new NotFoundException('NOT_FOUND');
    if (item.property.owner_id !== ownerId) throw new ForbiddenException('PROPERTY_AUTH2');

    return item;
  }

  /**
   * update
   * @param propertyAuthorizeId
   * @param dto
   * @returns
   */
  async update(
    propertyAuthorizeId: number,
    dto: UpdatePropertyAuthorizeOwnerDto,
  ): Promise<PropertyAuthorize> {
    const item = await this.db.propertyAuthorize.update({
      where: { id: propertyAuthorizeId },
      data: {
        nc_image_id: dto.nc_image_id,
        status: PropertyAuthorizeStatuses.PENDING,
        docs: { set: [], connect: dto.docs?.map((e) => ({ id: +e })) },
      },
    });

    return item;
  }

  // /**
  //  * remove
  //  * @param propertyAuthorizeId
  //  */
  // async remove(propertyAuthorizeId: number): Promise<void> {
  //   await this.db.propertyAuthorize.delete({ where: { id: propertyAuthorizeId } });
  // }
}
