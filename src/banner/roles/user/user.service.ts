import { Injectable } from '@nestjs/common';
import { Banner, Prisma } from '@prisma/client';
import { groupBy } from 'lodash';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllBannerUserDto, FindAllBannerUserV2Dto } from './dto/find-all.dto';

@Injectable()
export class BannerUserService {
  constructor(private readonly db: PrismaService) {}

  /**
   * find all Banner
   * @param dto
   * @returns
   */
  async findAll(dto: FindAllBannerUserDto): Promise<Partial<Banner>[]> {
    let query: Prisma.BannerWhereInput = { is_active: true, position: dto.position };
    //حداقل یک عکس داشته باشه
    query = { ...query, NOT: { AND: [{ image_sm_id: null, image_id: null }] } };

    const take = 10;

    const result = await this.db.banner.findMany({
      where: query,
      orderBy: { sort_order: { sort: 'asc', nulls: 'last' } },
      select: {
        id: true,
        image: true,
        link: true,
        view_count: true,
        image_sm: true,
        property: { select: { id: true, slug: true } },
      },
      take,
    });

    return result;
  }

  async findAllV2(dto: FindAllBannerUserV2Dto): Promise<any> {
    let query: Prisma.BannerWhereInput = { is_active: true, position: { in: dto.positions } };
    //حداقل یک عکس داشته باشه
    query = { ...query, NOT: { AND: [{ image_sm_id: null, image_id: null }] } };

    const result = await this.db.banner.findMany({
      where: query,
      orderBy: { sort_order: { sort: 'asc', nulls: 'last' } },
      select: {
        id: true,
        image: true,
        image_sm: true,
        link: true,
        position: true,
        view_count: true,
        property: { select: { id: true, slug: true } },
      },
    });

    // console.log(result?.map((e) => e.position));

    const grouped = groupBy(result, 'position');
    return grouped;
  }

  /**
   *
   * @param bannerId
   */
  async updateViewCount(bannerId: number): Promise<void> {
    const banner = await this.db.banner.findFirst({ where: { id: bannerId, is_active: true } });

    if (banner) {
      await this.db.banner.update({
        where: { id: bannerId, is_active: true },
        data: { view_count: { increment: 1 } },
      });
    }
  }
}
