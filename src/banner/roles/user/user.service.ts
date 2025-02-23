import { Injectable } from '@nestjs/common';
import { Banner, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllBannerUserDto } from './dto/find-all.dto';

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
}
