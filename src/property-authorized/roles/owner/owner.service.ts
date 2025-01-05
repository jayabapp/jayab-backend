import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyAuthorized, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePropertyAuthorizedOwnerDto } from './dto/create.dto';
import { UpdatePropertyAuthorizedOwnerDto } from './dto/update.dto';
import { FindAllPropertyAuthorizedOwnerDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';

@Injectable()
export class PropertyAuthorizedOwnerService {
  constructor(private readonly db: PrismaService) {}

  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreatePropertyAuthorizedOwnerDto): Promise<PropertyAuthorized> {
    const newPropertyAuthorized = await this.db.propertyAuthorized.create({ data: dto });
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
  async findOne(propertyAuthorizedId: number): Promise<PropertyAuthorized> {
    const item = await this.db.propertyAuthorized.findFirst({
      where: { id: propertyAuthorizedId },
    });

    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
  }

  /**
   * update
   * @param propertyAuthorizedId
   * @param dto
   * @returns
   */
  async update(propertyAuthorizedId: number, dto: UpdatePropertyAuthorizedOwnerDto): Promise<PropertyAuthorized> {
    const item = await this.db.propertyAuthorized.update({
      where: { id: propertyAuthorizedId },
      data: dto,
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
