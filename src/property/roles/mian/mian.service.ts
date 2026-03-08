import { BadRequestException, Injectable } from '@nestjs/common';
import { Property, PropertyCalendar } from '@prisma/client';
import moment from 'moment-jalaali';
import { convertJalaaliDtoToDate } from 'src/common/helpers/date.helper';
import { JALAALI_FORMAT } from 'src/common/utils/constants/date.constant';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyStatuses } from 'src/property/common/types/property-status.type';
import { PropertyArrayResType } from 'src/property/serializer/property.serializer';
import { WebhookActionDto } from './dto/webhook.dto';
import { FindAllPropertyMianDto } from './dto/find-all.dto';

@Injectable()
export class PropertyMianService {
  constructor(private readonly db: PrismaService) {}

  /**
   *
   * @param propertyId
   * @returns
   */
  async findOnePropById(propertyId: number): Promise<Property> {
    const p = await this.db.property.findUnique({ where: { id: propertyId } });
    return p;
  }

  /**
   * find all host Properties
   * @param dto
   * @returns
   */
  async findHostProperties(dto: FindAllPropertyMianDto): Promise<Partial<PropertyArrayResType>[]> {
    const user = await this.db.user.findUnique({ where: { mobile_number: dto.phone_number } });
    if (!user) throw new BadRequestException('MIAN1');

    const list = await this.db.property.findMany({
      where: { owner: { user: { mobile_number: dto.phone_number } }, status: PropertyStatuses.PUBLISHED },
      orderBy: { sort_order: 'desc' },
    });

    const formatted = list.map((e) => ({ property_id: e.id, title: e.title }));

    return formatted;
  }

  /**
   * block
   * @param dto
   * @returns
   */
  async block(dto: WebhookActionDto): Promise<void> {
    await this.db.$transaction(
      async (tx) => {
        for (const e of dto.dates) {
          const { year, month, day } = this.checkDate(e);
          const reservedRec = await this.findReservedRecord(dto.property_id, year, month, day);
          if (reservedRec?.is_reserved) continue;

          await tx.propertyCalendar.upsert({
            where: { property_id_day_month_year: { property_id: dto.property_id, day, month, year } },
            update: { is_reserved: true },
            create: {
              property_id: dto.property_id,
              day,
              month,
              year,
              date: convertJalaaliDtoToDate({ day, month, year }),
              is_reserved: true,
            },
          });
        }
      },
      { maxWait: 10 * 1000, timeout: 10 * 1000 },
    );
  }

  /**
   * unblock
   * @param dto
   * @returns
   */
  async unBlock(dto: WebhookActionDto): Promise<void> {
    await this.db.$transaction(
      async (tx) => {
        for (const e of dto.dates) {
          const { year, month, day } = this.checkDate(e);
          const reservedRec = await this.findReservedRecord(dto.property_id, year, month, day);
          if (!reservedRec?.is_reserved) continue;

          await tx.propertyCalendar.update({ where: { id: reservedRec.id }, data: { is_reserved: false } });
        }
      },
      { maxWait: 10 * 1000, timeout: 10 * 1000 },
    );
  }

  private async findReservedRecord(
    propertyId: number,
    year: number,
    month: number,
    day: number,
  ): Promise<PropertyCalendar> {
    const propCalendar = await this.db.propertyCalendar.findUnique({
      where: { property_id_day_month_year: { property_id: propertyId, year, month, day } },
    });

    return propCalendar;
  }

  private checkDate(date: string): { year: number; month: number; day: number } {
    if (!moment(date).isValid()) throw new BadRequestException(`فرمت تاریخ ${date} قابل قبول نیست`);

    const jalaaliDate = moment(date).format(JALAALI_FORMAT);
    const splittedDate = jalaaliDate.split('/');

    const year = Number(splittedDate[0]);
    const month = Number(splittedDate[1]);
    const day = Number(splittedDate[2]);

    return { year, month, day };
  }
}
