import { Injectable } from '@nestjs/common';
import { Banner, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllBannerUserDto, FindAllBannerUserV2Dto } from './dto/find-all.dto';
import { groupBy } from 'lodash';

@Injectable()
export class BannerUserService {
  constructor(private readonly db: PrismaService) {}

  /**
   * find all Banner
   * @param dto
   * @returns
   */
  async findAll(dto: FindAllBannerUserDto): Promise<Partial<Banner>[]> {
    const query: Prisma.BannerWhereInput = { is_active: true, position: dto.position };

    const take = 10;

    const result = await this.db.banner.findMany({
      where: query,
      orderBy: { sort_order: { sort: 'asc', nulls: 'last' } },
      select: {
        id: true,
        image: true,
        link: true,
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
    query = { ...query, OR: [{ image_id: { not: null }, image_sm_id: { not: null } }] };

    const result = await this.db.banner.findMany({
      where: query,
      orderBy: { sort_order: { sort: 'asc', nulls: 'last' } },
      select: {
        image: true,
        image_sm: true,
        link: true,
        position: true,
        property: { select: { id: true, slug: true } },
      },
    });

    const grouped = groupBy(result, 'position');
    return grouped;
  }
}
