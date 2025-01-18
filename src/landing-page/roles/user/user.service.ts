import { Injectable, NotFoundException } from '@nestjs/common';
import { LandingPage, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllLandingPageUserDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';

@Injectable()
export class LandingPageUserService {
  constructor(private readonly db: PrismaService) {}

  /**
   * find all LandingPage
   * @param dto
   * @returns
   */
  async findAll(dto: FindAllLandingPageUserDto): Promise<LandingPage[]> {
    const list = await this.db.landingPage.findMany({
      where: { is_active: true },
      include: { image: true },
      orderBy: { sort_order: { sort: 'asc', nulls: 'last' } },
    });

    return list;
  }

  /**
   * find one landingPage
   * @param landingPageId
   * @returns
   */
  async findOne(landingPageId: number): Promise<LandingPage> {
    const item = await this.db.landingPage.findFirst({
      where: { id: landingPageId },
    });

    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
  }
}
