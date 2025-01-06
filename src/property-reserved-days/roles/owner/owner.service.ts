import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyReservedDays, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePropertyReservedDaysOwnerDto } from './dto/create.dto';
import { FindAllPropertyReservedDaysOwnerDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';

@Injectable()
export class PropertyReservedDaysOwnerService {
  constructor(private readonly db: PrismaService) {}

  /**
   * create
   * @param dto
   * @returns
   */
  async create(propertyId: number, dto: CreatePropertyReservedDaysOwnerDto): Promise<void> {
    let prevRec = await this.db.propertyReservedDays.findUnique({
      where: {
        property_id_day_month_year: {
          property_id: propertyId,
          day: dto.day,
          month: dto.month,
          year: dto.year,
        },
      },
    });

    if (prevRec) await this.db.propertyReservedDays.delete({ where: { id: prevRec.id } });
    else await this.db.propertyReservedDays.create({ data: { ...dto, property_id: propertyId } });

    return;
  }

  /**
   * find all PropertyReservedDays
   * @param dto
   * @returns
   */
  // async findAll(
  //   dto: FindAllPropertyReservedDaysOwnerDto,
  // ): Promise<CursorPaginatedResult<PropertyReservedDays>> {
  //   const list = await cursorPaginate()<PropertyReservedDays, Prisma.PropertyReservedDaysFindManyArgs>(
  //     this.db.propertyReservedDays,
  //     {},
  //     { cursor: dto.cursor },
  //   );

  //   return list;
  // }
}
