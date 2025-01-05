import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PropertyAuthorized, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePropertyAuthorizedOwnerDto } from './dto/create.dto';
import { UpdatePropertyAuthorizedOwnerDto } from './dto/update.dto';
import { FindAllPropertyAuthorizedOwnerDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import { CommonStatuses } from 'src/common/interfaces/common-status.interface';
import { PropertyAuthorizeStatuses } from 'src/property-authorized/common/property-authorize-status.type';

@Injectable()
export class PropertyAuthorizedOwnerService {
  constructor(private readonly db: PrismaService) {}

  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreatePropertyAuthorizedOwnerDto): Promise<PropertyAuthorized> {
    const newPropertyAuthorized = await this.db.propertyAuthorized.create({
      data: {
        nc_image_id: dto.nc_image_id,
        property_id: dto.property_id,
        status: PropertyAuthorizeStatuses.PENDING,
        docs: { connect: dto.docs?.map((e) => ({ id: +e })) },
      },
    });
    return newPropertyAuthorized;
  }

  /**
   * find all PropertyAuthorized
   * @param dto
   * @returns
   */
  async findAll(dto: FindAllPropertyAuthorizedOwnerDto): Promise<CursorPaginatedResult<PropertyAuthorized>> {
    const list = await cursorPaginate()<PropertyAuthorized, Prisma.PropertyAuthorizedFindManyArgs>(
      this.db.propertyAuthorized,
      {},
      { cursor: dto.cursor },
    );

    return list;
  }

  /**
   * find one propertyAuthorized
   * @param propertyAuthorizedId
   * @returns
   */
  async findOne(propertyAuthorizedId: number, ownerId: number): Promise<PropertyAuthorized> {
    const item = await this.db.propertyAuthorized.findFirst({
      where: { id: propertyAuthorizedId },
      include: { property: { select: { owner_id: true } } },
    });

    if (!item) throw new NotFoundException('NOT_FOUND');
    if (item.property.owner_id !== ownerId) throw new ForbiddenException('PROPERTY_AUTH2');

    return item;
  }

  /**
   * update
   * @param propertyAuthorizedId
   * @param dto
   * @returns
   */
  async update(
    propertyAuthorizedId: number,
    dto: UpdatePropertyAuthorizedOwnerDto,
  ): Promise<PropertyAuthorized> {
    const item = await this.db.propertyAuthorized.update({
      where: { id: propertyAuthorizedId },
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
  //  * @param propertyAuthorizedId
  //  */
  // async remove(propertyAuthorizedId: number): Promise<void> {
  //   await this.db.propertyAuthorized.delete({ where: { id: propertyAuthorizedId } });
  // }
}
