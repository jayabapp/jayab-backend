import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { City } from '@prisma/client';

@Injectable()
export class CitySharedService {
  constructor(private readonly db: PrismaService) {}

  /**
   * Get provinces
   * @returns
   */
  async findParent(): Promise<Array<Partial<City>>> {
    const cities = await this.db.city.findMany({
      where: { parent_id: null },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        title: true,
      },
    });
    return cities;
  }

  /**
   * Get Cities by parent id
   * @param parentId
   * @returns
   */
  async findChilds(parentId: number): Promise<Array<Partial<City>>> {
    const cities = await this.db.city.findMany({
      where: { parent_id: parentId },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        title: true,
      },
    });
    return cities;
  }
}
