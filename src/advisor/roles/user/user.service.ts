import { Injectable, NotFoundException } from '@nestjs/common';
import { Advisor, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdvisorUserDto } from './dto/create.dto';
import { UpdateAdvisorUserDto } from './dto/update.dto';
import { FindAllAdvisorUserDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import { AdvisorStatus } from 'src/advisor/common/advisor-status.type';
import moment from 'moment-jalaali';

@Injectable()
export class AdvisorUserService {
  constructor(private readonly db: PrismaService) {}

  /**
   * find all Advisor
   * @param dto
   * @returns
   */
  async findAll(dto: FindAllAdvisorUserDto): Promise<any> {
    /*  */
    let query: Prisma.AdvisorWhereInput = { status: AdvisorStatus.APPROVED };
    if (dto.q) query = { ...query, user: { full_name: { contains: dto.q } } };
    if (dto.cities) query = { ...query, cities: { some: { id: { in: dto.cities } } } };

    /*  */
    const list = await cursorPaginate()<
      Advisor & { cities: { title: string }[] },
      Prisma.AdvisorFindManyArgs
    >(
      this.db.advisor,
      {
        where: query,
        select: {
          id: true,
          created_at: true,
          users_satisfaction: true,
          owners_satisfaction: true,
          cities: { select: { title: true } },
          user: { select: { full_name: true, referral_code: true, profile_image: true } },
        },
      },
      { cursor: dto.cursor },
    );

    const result = list.data.map((e) => ({
      ...e,
      work_history_in_month: moment(moment()).diff(e.created_at, 'months') || 1,
      cities: e.cities.map((c) => c.title),
    }));

    return result;
  }

  /**
   * find one advisor
   * @param advisorId
   * @returns
   */
  async findOne(advisorId: number): Promise<Partial<Advisor>> {
    let item = await this.db.advisor.findFirst({
      where: { id: advisorId },
      select: {
        id: true,
        created_at: true,
        users_satisfaction: true,
        owners_satisfaction: true,
        response_speed_and_followup: true,
        advisor_behavior: true,
        advisor_responsibility: true,
        cities: { select: { title: true } },
        user: { select: { full_name: true, mobile_number: true, referral_code: true, profile_image: true } },
      },
    });

    if (!item) throw new NotFoundException('NOT_FOUND');

    item = {
      ...item,
      // @ts-ignore
      cities: item.cities.map((c) => c.title),
      work_history_in_month: moment(moment()).diff(item.created_at, 'months') || 1,
    };

    return item;
  }

  /**
   * find one by national code
   * @param nationalCode
   * @returns
   */
  async findOneByNationalCode(nationalCode: string): Promise<Advisor> {
    const item = await this.db.advisor.findUnique({ where: { national_code: nationalCode } });
    return item;
  }

  // /**
  //  * update
  //  * @param advisorId
  //  * @param dto
  //  * @returns
  //  */
  // async update(advisorId: number, dto: UpdateAdvisorUserDto): Promise<Advisor> {
  //   const item = await this.db.advisor.update({
  //     where: { id: advisorId },
  //     data: dto,
  //   });

  //   return item;
  // }

  // /**
  //  * remove
  //  * @param advisorId
  //  */
  // async remove(advisorId: number): Promise<void> {
  //   await this.db.advisor.delete({ where: { id: advisorId } });
  // }
}
