import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { persianSearchVariants } from 'src/property/common/helpers/search-text.helper';
import { parseQueryNumberArray } from 'src/common/helpers/parse-query-array.pipe';
import { FindAllCityUserDto } from './roles/user/dto/find-all.dto';
import { localizeCityTree } from './common/helpers/city-locale.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { City, Prisma } from '@prisma/client';
import { Locale } from 'src/common/dto/locale.dto';

@Injectable()
export class CitySharedService {
  constructor(private readonly db: PrismaService) {}

  async findAll(dto: FindAllCityUserDto): Promise<Array<Partial<City>>> {
    let query: Prisma.CityWhereInput = {};
    if (dto.cities) query = { ...query, id: { in: parseQueryNumberArray(dto.cities) } };
    if (dto.is_parent) query = { ...query, parent_id: null };
    if (dto.q) {
      query = {
        ...query,
        OR: persianSearchVariants(dto.q).map((variant) => ({
          title: { contains: variant, mode: 'insensitive' },
        })),
      };
    }

    const cities = await this.db.city.findMany({
      where: query,
      orderBy: [{ sort_order: { sort: 'asc', nulls: 'last' } }, { title: 'asc' }],
      select: {
        id: true,
        title: true,
        translations: true,
        slug: true,
        image: true,
        child: {
          where: { deleted_at: null },
          orderBy: [{ sort_order: { sort: 'asc', nulls: 'last' } }, { title: 'asc' }],
          select: {
            id: true,
            title: true,
            translations: true,
            child: {
              where: { deleted_at: null },
              orderBy: [{ sort_order: { sort: 'asc', nulls: 'last' } }, { title: 'asc' }],
              select: {
                id: true,
                title: true,
                translations: true,
              },
            },
          },
        },
      },
    });

    return cities.map((city) => localizeCityTree(city, dto.locale));
  }

  async findChildren(parentId: number, locale: Locale = 'fa'): Promise<Array<Partial<City>>> {
    const cities = await this.db.city.findMany({
      where: { parent_id: parentId },
      orderBy: [{ sort_order: { sort: 'asc', nulls: 'last' } }, { title: 'asc' }],
      select: {
        id: true,
        title: true,
        translations: true,
        image: true,
        child: {
          where: { deleted_at: null },
          orderBy: [{ sort_order: { sort: 'asc', nulls: 'last' } }, { title: 'asc' }],
          select: {
            id: true,
            title: true,
            translations: true,
            child: {
              where: { deleted_at: null },
              orderBy: [{ sort_order: { sort: 'asc', nulls: 'last' } }, { title: 'asc' }],
              select: {
                id: true,
                title: true,
                translations: true,
              },
            },
          },
        },
      },
    });
    return cities.map((city) => localizeCityTree(city, locale));
  }

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

  async findOne(id: number): Promise<City> {
    const city = await this.db.city.findUnique({ where: { id }, include: { parent: true } });
    if (!city) throw new NotFoundException('NOT_FOUND');
    return city;
  }

  async checkCitiesExist(cityIds: number[]): Promise<void> {
    const checkCitiesInDB = await this.db.city.count({
      where: { id: { in: cityIds }, parent_id: { not: null } },
    });

    if (checkCitiesInDB !== cityIds.length) throw new UnprocessableEntityException('CITY1');
  }
}
