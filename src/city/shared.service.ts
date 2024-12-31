import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { City, Prisma } from '@prisma/client';

@Injectable()
export class CitySharedService {
  constructor(private readonly db: PrismaService) {}

  /**
   * Get provinces
   * @returns
   */
  async findParents(): Promise<Array<Partial<City>>> {
    const cities = await this.db.city.findMany({
      where: { parent_id: null },
      orderBy: { sort_order: { sort: 'asc', nulls: 'last' } },
      select: {
        id: true,
        title: true,
        image: true,
        child: {
          select: { id: true, title: true },
          take: 5,
        },
      },
    });
    return cities;
  }

  async findAll(q: string): Promise<Array<Partial<City>>> {
    let query: Prisma.CityWhereInput = {};
    if (!q) return [];
    if (q) query = { ...query, title: { contains: q } };

    const cities = await this.db.city.findMany({
      where: query,
      orderBy: { sort_order: { sort: 'asc', nulls: 'last' } },
      select: {
        id: true,
        title: true,
        parent: { select: { title: true } },
      },
    });

    return cities;
  }

  /**
   * Get Cities by parent id
   * @param parentId
   * @returns
   */
  async findChildren(parentId: number): Promise<Array<Partial<City>>> {
    const cities = await this.db.city.findMany({
      where: { parent_id: parentId },
      orderBy: { sort_order: { sort: 'asc', nulls: 'last' } },
      select: {
        id: true,
        title: true,
        image: true,
        // child: {
        //   select: {
        //     id: true,
        //     title: true,
        //   },
        //   orderBy: { sort_order: { sort: 'asc', nulls: 'last' } },
        // },
      },
    });
    return cities;
  }

  /**
   * Get Cities by parent id
   * @param parentId
   * @returns
   */
  async findCities(): Promise<Array<Partial<City>>> {
    const cities = await this.db.city.findMany({
      where: { parent_id: { not: null } },
      orderBy: { sort_order: { sort: 'asc', nulls: 'last' } },
      select: {
        id: true,
        title: true,
      },
    });
    return cities;
  }

  /**
   *
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<City> {
    const city = await this.db.city.findUnique({ where: { id }, include: { parent: true } });
    if (!city) throw new NotFoundException('NOT_FOUND');
    return city;
  }

  async checkCitiesExist(cityIds: number[]): Promise<void> {
    // check cities - check parent 'is null' to prevent not city item to be save
    const checkCitiesInDB = await this.db.city.count({
      where: { id: { in: cityIds }, parent_id: { not: null } },
    });

    if (checkCitiesInDB !== cityIds.length) throw new UnprocessableEntityException('CITY1');
  }
}
