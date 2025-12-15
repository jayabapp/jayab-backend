import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Advisor, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdvisorUserDto } from './dto/create.dto';
import { UpdateAdvisorUserDto } from './dto/update.dto';
import { FindAllAdvisorUserDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import { AdvisorStatus } from 'src/advisor/common/advisor-status.type';
import moment from 'moment-jalaali';
import { AddRateUserDto } from '../admin/dto/create.dto';
import { parseQueryNumberArray } from 'src/common/helpers/parse-query-array.pipe';

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
    let query: Prisma.AdvisorWhereInput = { status: AdvisorStatus.APPROVED, is_special: true };
    if (dto.q)
      query = {
        ...query,
        user: { OR: [{ full_name: { contains: dto.q } }, { referral_code: dto.q }] },
      };
    if (dto.cities) {
      const cities = parseQueryNumberArray(dto.cities);
      query = { ...query, cities: { some: { id: { in: cities } } } };
    }

    if (dto.province_id) query = { ...query, cities: { some: { parent_id: dto.province_id } } };

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
        orderBy: { created_at: 'asc' },
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
  async findOne(userId: number, advisorId: number): Promise<Partial<Advisor>> {
    let item = await this.db.advisor.findFirst({
      where: { id: advisorId, status: AdvisorStatus.APPROVED },
      select: {
        id: true,
        created_at: true,
        users_satisfaction: true,
        owners_satisfaction: true,
        response_speed_and_followup: true,
        advisor_behavior: true,
        advisor_responsibility: true,
        cities: { select: { title: true } },
        user: {
          select: {
            id: true,
            full_name: true,
            mobile_number: true,
            referral_code: true,
            profile_image: true,
          },
        },
      },
    });

    if (!item) throw new NotFoundException('NOT_FOUND');

    /*  */
    let result = {
      ...item,
      cities: item.cities.map((c) => c.title),
      work_history_in_month: moment(moment()).diff(item.created_at, 'months') || 1,
      can_user_add_rate: null,
      user_rate: null,
    };

    /*  */
    const userRate = await this.db.rate.findUnique({
      where: { user_id_advisor_id: { user_id: userId, advisor_id: advisorId } },
      select: { advisor_responsibility: true, response_speed_and_followup: true, advisor_behavior: true },
    });

    result = { ...result, can_user_add_rate: Boolean(userRate), user_rate: userRate };

    return result;
  }

  /**
   * find by id
   * @param advisorId
   * @returns
   */
  async findById(userId: number, advisorId: number): Promise<Advisor> {
    const item = await this.db.advisor.findFirst({
      where: { id: advisorId, status: AdvisorStatus.APPROVED },
      include: { user: { select: { id: true } } },
    });

    if (!item) throw new NotFoundException('NOT_FOUND');
    return item;
  }

  /**
   * find one by national code
   * @param nationalCode
   * @returns
   */
  async findOneByNationalCode(advisorId: number, nationalCode: string): Promise<Advisor> {
    let query: Prisma.AdvisorWhereInput = { national_code: nationalCode };
    if (advisorId) query = { ...query, id: { not: advisorId } };
    const item = await this.db.advisor.findFirst({ where: query });
    return item;
  }

  async initRate(userId: number, advisorId: number): Promise<void> {
    await this.db.rate.upsert({
      where: { user_id_advisor_id: { user_id: userId, advisor_id: advisorId } },
      create: { user_id: userId, advisor_id: advisorId },
      update: {},
    });
  }

  async addRate(userId: number, advisorId: number, dto: AddRateUserDto): Promise<void> {
    /*  */
    const userRate = await this.db.rate.findUnique({
      where: { user_id_advisor_id: { user_id: userId, advisor_id: advisorId } },
    });
    if (!userRate) throw new BadRequestException('RATE1');

    await this.db.$transaction(async (tx) => {
      await tx.rate.update({ where: { id: userRate.id }, data: dto });

      /*  */
      const rates = await tx.rate.aggregate({
        where: { advisor_id: advisorId },
        _avg: { advisor_responsibility: true, response_speed_and_followup: true, advisor_behavior: true },
      });

      const behaviorRate = Math.ceil(rates._avg.advisor_behavior);
      const responsibilityRate = Math.ceil(rates._avg.advisor_responsibility);
      const speedAndFollowUpRate = Math.ceil(rates._avg.response_speed_and_followup);
      const usersSatisfaction = Math.ceil((behaviorRate + responsibilityRate + speedAndFollowUpRate) / 3);

      await tx.advisor.update({
        where: { id: advisorId },
        data: {
          advisor_behavior: behaviorRate,
          advisor_responsibility: responsibilityRate,
          response_speed_and_followup: speedAndFollowUpRate,
          users_satisfaction: usersSatisfaction,
        },
      });
    });
  }
}
