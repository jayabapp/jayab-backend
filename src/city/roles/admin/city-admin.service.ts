import { createPropsBuilder, showPropsBuilder } from 'src/city/common/helpers/model-props-builder.helper';
import { CreateProps, ShowAction, ShowProps } from 'src/common/interfaces/model-props.interface';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UnprocessableEntityException } from '@nestjs/common';
import { PaginatedResult, paginate } from 'src/common/helpers/paginator';
import { withTitleTranslations } from 'src/common/helpers/title-translations.helper';
import { FindAllCityAdminDto } from './dto/find-all.dto';
import { CreateCityAdminDto } from './dto/create-city-admin.dto';
import { isEmpty, isInteger } from 'lodash';
import { UpdateCityAdminDto } from './dto/update-city-admin.dto';
import { NotFoundException } from '@nestjs/common';
import { hasPersianLetter } from 'src/common/helpers/persian-regex';
import { PrismaService } from 'src/prisma/prisma.service';
import { City, Prisma } from '@prisma/client';

export type RecursiveCity = City & { parent: RecursiveCity | null };

@Injectable()
export class CityAdminService {
  constructor(private readonly db: PrismaService) {}

  async create(dto: CreateCityAdminDto): Promise<City> {
    if (dto.slug) {
      const isDuplicatedSlug = await this.db.city.findFirst({ where: { slug: dto.slug } });
      if (isDuplicatedSlug) throw new BadRequestException('CITY2');
      if (hasPersianLetter(dto.slug)) throw new UnprocessableEntityException('CITY3');
    }

    const city = await this.db.city.create({ data: withTitleTranslations(dto) });
    return city;
  }

  async update(cityId: number, dto: UpdateCityAdminDto): Promise<void> {
    if (dto.slug) {
      const isDuplicatedSlug = await this.db.city.findFirst({
        where: { slug: dto.slug, id: { not: cityId } },
      });
      if (isDuplicatedSlug) throw new BadRequestException('CITY2');
      if (hasPersianLetter(dto.slug)) throw new UnprocessableEntityException('CITY3');
    }

    const city = await this.db.city.findUnique({ where: { id: cityId } });
    if (!city) throw new NotFoundException('COMMON1');

    await this.db.city.update({ where: { id: cityId }, data: withTitleTranslations(dto) });
  }

  async remove(id: number): Promise<void> {
    await this.db.$transaction(async (tx) => {
      await tx.city.deleteMany({ where: { parent_id: id } });
      await tx.city.delete({ where: { id } });
    });
  }

  async findAll(dto: FindAllCityAdminDto, page: number, perPage = 50): Promise<PaginatedResult<City>> {
    let q: Prisma.CityWhereInput = {};
    if (dto.title) q = { ...q, title: { contains: dto.title } };
    if (dto.is_parent === 1) q = { ...q, parent_id: null };
    else if (dto.is_parent === 0) q = { ...q, parent_id: { not: null } };

    const list = await paginate()<City, Prisma.CityFindManyArgs>(
      this.db.city,
      {
        where: q,
        select: {
          id: true,
          title: true,
          slug: true,
          slug_fa: true,
        },
        orderBy: [{ sort_order: { sort: 'asc', nulls: 'last' } }, { title: 'asc' }],
      },
      { page, perPage },
    );

    return list;
  }

  async findParents(ids?: number[], filters?: any): Promise<Array<City>> {
    let query: Prisma.CityWhereInput = { parent_id: null };
    if (!isEmpty(ids)) query = { ...query, id: { in: ids } };
    if (filters) query = { ...query, ...filters };
    const cities = await this.db.city.findMany({
      where: query,
      orderBy: { id: 'asc' },
    });
    return cities;
  }

  async findAllCascade(): Promise<Array<City>> {
    const cities = await this.db.city.findMany({
      where: { parent_id: null },
      orderBy: [{ sort_order: { sort: 'asc', nulls: 'last' } }, { title: 'asc' }],
      include: {
        parent: true,
        image: true,
        child: {
          where: { deleted_at: null },
          orderBy: [{ sort_order: { sort: 'asc', nulls: 'last' } }, { title: 'asc' }],
          include: {
            image: true,
            child: {
              where: { deleted_at: null },
              orderBy: [{ sort_order: { sort: 'asc', nulls: 'last' } }, { title: 'asc' }],
            },
          },
        },
      },
    });

    return cities;
  }

  async findChildren(parentId: number | null): Promise<Array<Partial<City>>> {
    const cities = await this.db.city.findMany({
      where: { parent_id: parentId },
      orderBy: { id: 'asc' },
      select: { id: true, title: true },
    });
    return cities;
  }

  async findLastLevels(): Promise<Array<RecursiveCity>> {
    const cities = await this.db.city.findMany({ where: { child: { none: {} } }, orderBy: { id: 'asc' } });
    const formattedCities = this.formatCityList(cities);
    return formattedCities;
  }

  async findById(cityId: number): Promise<City> {
    const city = await this.db.city.findUnique({ where: { id: cityId } });
    if (!city) throw new NotFoundException('NOT_FOUND');
    return city;
  }

  async findOne(cityId: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const city = await this.db.city.findUnique({ where: { id: cityId }, include: { image: true } });
    if (!city) throw new NotFoundException('NOT_FOUND');
    const showProps = showPropsBuilder(city);
    return { showProps };
  }

  async findModelProps(): Promise<{
    createProps: Array<CreateProps>;
  }> {
    const createProps = createPropsBuilder();
    return { createProps };
  }

  formatCityList(cities: City[]): any {
    const formattedCities: { id: number; title: string }[] = [];
    for (const cat of cities as Array<RecursiveCity>) {
      const titles = [cat.title];
      let parent = cat.parent;
      while (!isEmpty(parent)) {
        titles.push(parent.title);
        parent = parent.parent;
      }
      formattedCities.push({ id: cat.id, title: titles.reverse().join(' -> ') });
    }
    return formattedCities;
  }

  async validateParentCities(ids: number[]): Promise<number[]> {
    const intIds = [];
    ids.map((e) => {
      if (isInteger(+e)) intIds.push(+e);
    });
    if (intIds.length != ids?.length) throw new BadRequestException('SPEC1');
    const parents = await this.findParents(intIds);
    if (parents?.length != ids?.length) throw new BadRequestException('SPEC1');
    return intIds;
  }
}
