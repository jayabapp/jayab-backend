import { Injectable, UnprocessableEntityException } from '@nestjs/common';
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

  async checkCitiesExist(cityIds: number[]): Promise<void> {
    // check cities - check parent 'is null' to prevent not city item to be save
    const checkCitiesInDB = await this.db.city.count({
      where: { id: { in: cityIds }, parent_id: { not: null } },
    });

    if (checkCitiesInDB !== cityIds.length) throw new UnprocessableEntityException('CITY1');
  }
}
