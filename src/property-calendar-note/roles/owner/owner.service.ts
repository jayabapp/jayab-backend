import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePropertyCalendarNoteOwnerDto } from './dto/create.dto';

@Injectable()
export class PropertyCalendarNoteOwnerService {
  constructor(private readonly db: PrismaService) {}
  /**
   * create
   * @param dto
   * @returns
   */
  async create(propertyId: number, dto: CreatePropertyCalendarNoteOwnerDto): Promise<void> {
    let prevRec = await this.db.propertyCalendarNote.findUnique({
      where: {
        property_id_day_month_year: {
          property_id: propertyId,
          day: dto.day,
          month: dto.month,
          year: dto.year,
        },
      },
    });

    /**
     * اگر نبود میسازیم
     * اگر بود و نت خالی بود پاکش میکنیم
     * اگر نه اپدیت میکنیم
     */

    if (!prevRec && dto.note)
      await this.db.propertyCalendarNote.create({ data: { ...dto, property_id: propertyId } });
    else if (prevRec && dto.note)
      await this.db.propertyCalendarNote.update({ where: { id: prevRec.id }, data: { note: dto.note } });
    else if (prevRec && !dto.note) await this.db.propertyCalendarNote.delete({ where: { id: prevRec.id } });

    return;
  }

  /**
   * find all PropertyCalendarNote
   * @param dto
   * @returns
   */
  // async findAll(
  //   dto: FindAllPropertyCalendarNoteOwnerDto,
  // ): Promise<CursorPaginatedResult<PropertyCalendarNote>> {
  //   const list = await cursorPaginate()<PropertyCalendarNote, Prisma.PropertyCalendarNoteFindManyArgs>(
  //     this.db.propertyCalendarNote,
  //     {},
  //     { cursor: dto.cursor },
  //   );

  //   return list;
  // }
}
