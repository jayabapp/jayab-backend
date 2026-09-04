import { Injectable, NotFoundException } from '@nestjs/common';
import { findCanonicalLocationLanding } from 'src/landing-page/common/canonical-landing.helper';
import { FindAllLandingPageUserDto } from './dto/find-all.dto';
import { ResolveLandingLocationDto } from './dto/resolve-location.dto';
import { LandingPage, Prisma } from '@prisma/client';
import { groupBy, isEmpty } from 'lodash';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LandingPageUserService {
  constructor(private readonly db: PrismaService) {}

  async resolveLocation(dto: ResolveLandingLocationDto): Promise<{ url: string } | null> {
    const url = await findCanonicalLocationLanding(this.db, {
      cityId: dto.city_id,
      provinceId: dto.province_id,
    });
    return url ? { url } : null;
  }

  /**
   * find all LandingPage
   * @param dto
   * @returns
   */
  async findAll(dto: FindAllLandingPageUserDto): Promise<Record<string, Array<Partial<LandingPage>>>> {
    const q: Prisma.LandingPageWhereInput = { is_active: true };
    if (dto.placement === 'home') q['show_in_home'] = true;
    else if (dto.placement === 'footer') q['show_in_footer'] = true;

    const list = await this.db.landingPage.findMany({
      where: q,
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
      where: { url: landingPageUrl, is_active: true },
      include: {
        image: true,
        main_content: {
          include: {
            questions: {
              where: { is_publish: true },
              select: {
                id: true,
                question: true,
                answer: true,
                updated_at: true,
              },
              orderBy: { id: 'asc' },
            },
          },
        },
      },
    });

    if (!landing) throw new NotFoundException('NOT_FOUND');

    const options = {};
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

    const result: Record<string, any> = {
      query: {
        ...options,
      },
      content: landing.main_content,
      related_landings: relatedLandings,
    };
    if (landing.has_pool) result['query'] = { ...result['query'], has_pool: 1 };
    if (landing.min_discount_percentage > 0) result['query'] = { ...result['query'], has_discount: 1 };
    if (landing.is_premium) result['query'] = { ...result['query'], is_premium: 1 };
    if (landing.province_id) result['query'] = { ...result['query'], provinces: `${landing.province_id}` };
    else if (!isEmpty(cities)) result['query'] = { ...result['query'], cities: cities.map((e) => e.id) };
    return result;
  }
}
