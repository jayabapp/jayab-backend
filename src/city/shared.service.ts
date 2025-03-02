import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { City, Prisma } from '@prisma/client';
import { FindAllCityUserDto } from './roles/user/dto/find-all.dto';
import { parseQueryNumberArray } from 'src/common/helpers/parse-query-array.pipe';
import { PropertyStatuses } from 'src/property/common/types/property-status.type';
import { startOfToday } from 'src/common/helpers/date.helper';

@Injectable()
export class CitySharedService {
  constructor(private readonly db: PrismaService) {}

  /**
   * find all cities and provinces
   * @param dto
   * @returns
   */
  async findAll(dto: FindAllCityUserDto): Promise<Array<Partial<City>>> {
    let query: Prisma.CityWhereInput = {};
    if (dto.cities) query = { ...query, id: { in: parseQueryNumberArray(dto.cities) } };
    if (dto.is_parent) query = { ...query, parent_id: null };
    if (dto.q) query = { ...query, title: { contains: dto.q, mode: 'insensitive' } };

    const cities = await this.db.city.findMany({
      where: query,
      orderBy: [{ sort_order: { sort: 'asc', nulls: 'last' } }, { title: 'asc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        image: true,
        child: {
          select: { id: true, title: true },
          take: +dto.depth || 5,
        },
        // _count: {
        //   select: {
        //     Property_province: {
        //       where: { status: PropertyStatuses.PUBLISHED, subscription_expired_at: { gte: startOfToday() } },
        //     },
        //   },
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
  async findChildren(parentId: number): Promise<Array<Partial<City>>> {
    const cities = await this.db.city.findMany({
      where: { parent_id: parentId },
      orderBy: [{ sort_order: { sort: 'asc', nulls: 'last' } }, { title: 'asc' }],
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
