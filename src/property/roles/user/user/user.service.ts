import { Injectable, NotFoundException } from '@nestjs/common';
import { Property, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePropertyOwnerDto } from '../dto/create.dto';
import { UpdatePropertyUserDto } from '../dto/update.dto';
import { FindAllPropertyUserDto } from '../dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import { PropertyStatuses } from 'src/property/common/property-status.type';
import { OptionConnect } from 'src/common/interfaces/option-connect.interface';

@Injectable()
export class PropertyUserService {
  constructor(private readonly db: PrismaService) {}

  /**
   * find all Property
   * @param dto
   * @returns
   */
  async findAll(dto: FindAllPropertyUserDto): Promise<CursorPaginatedResult<Property>> {
    const list = await cursorPaginate()<Property, Prisma.PropertyFindManyArgs>(
      this.db.property,
      {},
      { cursor: dto.cursor },
    );

    return list;
  }

  /**
   * find one property
   * @param propertyId
   * @returns
   */
  async findOne(propertyId: number): Promise<Property> {
    const item = await this.db.property.findFirst({
      where: { id: propertyId },
    });

    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
  }
}
