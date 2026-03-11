import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyReserve, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePropertyReserveUserDto } from './dto/create.dto';
import { UpdatePropertyReserveUserDto } from './dto/update.dto';
import { FindAllPropertyReserveUserDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import { PropertyReserveStatus } from 'src/property-reserve/common/interfaces/property-reserve-status.type';
import { PropertyStatuses } from 'src/property/common/types/property-status.type';

@Injectable()
export class PropertyReserveUserService {
  constructor(private readonly db: PrismaService) {}

  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreatePropertyReserveUserDto, userId: number): Promise<PropertyReserve> {
    const property = await this.db.property.findFirst({
      where: { id: dto.property_id, status: PropertyStatuses.PUBLISHED },
    });
    if (!property) throw new NotFoundException('NOT_FOUND');

    const newPropertyReserve = await this.db.propertyReserve.create({
      data: { ...dto, user_id: userId, status: PropertyReserveStatus.PENDING },
    });
    return newPropertyReserve;
  }

  /**
   * find all PropertyReserve
   * @param dto
   * @returns
   */
  async findAll(dto: FindAllPropertyReserveUserDto): Promise<CursorPaginatedResult<PropertyReserve>> {
    const list = await cursorPaginate()<PropertyReserve, Prisma.PropertyReserveFindManyArgs>(
      this.db.propertyReserve,
      {},
      { cursor: dto.cursor },
    );

    return list;
  }

  /**
   * find one propertyReserve
   * @param propertyReserveId
   * @returns
   */
  async findOne(propertyReserveId: number): Promise<PropertyReserve> {
    const item = await this.db.propertyReserve.findFirst({
      where: { id: propertyReserveId },
    });

    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
  }

  /**
   * update
   * @param propertyReserveId
   * @param dto
   * @returns
   */
  async update(propertyReserveId: number, dto: UpdatePropertyReserveUserDto): Promise<PropertyReserve> {
    const item = await this.db.propertyReserve.update({
      where: { id: propertyReserveId },
      data: dto,
    });

    return item;
  }

  // /**
  //  * remove
  //  * @param propertyReserveId
  //  */
  // async remove(propertyReserveId: number): Promise<void> {
  //   await this.db.propertyReserve.delete({ where: { id: propertyReserveId } });
  // }
}
