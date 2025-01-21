import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentCategory, LandingPage, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllLandingPageUserDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import { ContentSharedService } from 'src/content/shared.service';
import { groupBy, isEmpty } from 'lodash';

@Injectable()
export class LandingPageUserService {
  constructor(
    private readonly db: PrismaService,
    private readonly contentSharedService: ContentSharedService,
  ) {}

  /**
   * find all LandingPage
   * @param dto
   * @returns
   */
  async findAll(dto: FindAllLandingPageUserDto): Promise<Record<string, Array<Partial<LandingPage>>>> {
    const list = await this.db.landingPage.findMany({
      where: { is_active: true },
      select: { url: true, title: true, image: true, position: true },
      orderBy: { sort_order: { sort: 'asc', nulls: 'last' } },
    });

    const grouped = groupBy(list, 'position');
    return grouped;
  }

  /**
   * find one landingPage
   * @param landingPageId
   * @returns
   */
  async findOne(landingPageUrl: string): Promise<any> {
    const landing = await this.db.landingPage.findFirst({
      where: { url: landingPageUrl },
      include: {
        image: true,
        main_content: {
          include: {
            questions: {
              where: { is_publish: true },
              select: { question: true, answer: true, updated_at: true },
            },
          },
        },
      },
    });

    if (!landing) throw new NotFoundException('NOT_FOUND');

    let options = {};
    if (!isEmpty(landing.options)) {
      const opt = await this.db.propertyOption.findMany({
        where: { id: { in: landing.options } },
      });
      const grouped = groupBy(opt, 'group');
      for (const key in grouped) {
        options[key.toLowerCase()] = grouped[key]?.map((e) => e.id);
      }
    }

    let cities = [];
    if (!isEmpty(landing.cities)) {
      cities = await this.db.city.findMany({
        where: { id: { in: landing.cities } },
        select: {
          id: true,
          title: true,
          slug: true,
        },
      });
    }

    //find related landings
    let relatedLandings: any;
    if (!isEmpty(landing.related_landings)) {
      relatedLandings = await this.db.landingPage.findMany({
        where: { id: { in: landing.related_landings } },
        select: {
          title: true,
          url: true,
        },
      });
    }

    return {
      query: {
        with_pool: landing.has_pool ? 1 : 0,
        has_discount: landing.min_discount_percentage > 0 ? 1 : 0,
        is_premium: landing.is_premium ? 1 : 0,
        cities: cities.map((e) => e.id),
        ...options,
      },
      content: landing.main_content,
      related_landings: relatedLandings,
      cities,
    };
  }
}
