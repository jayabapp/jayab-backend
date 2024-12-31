import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateCityAdminDto } from './dto/create-city-admin.dto';
import { UpdateCityAdminDto } from './dto/update-city-admin.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { City, Prisma } from '@prisma/client';
import { createPropsBuilder, showPropsBuilder } from 'src/city/common/helpers/model-props-builder.helper';
import { CreateProps, ShowAction, ShowProps } from 'src/common/interfaces/model-props.interface';
import { isEmpty, isInteger } from 'lodash';
import { PaginatedResult, paginate } from 'src/common/helpers/paginator';
import { hasPersianLetter } from 'src/common/helpers/persian-regex';

export type RecursiveCity = City & { parent: RecursiveCity | null };

@Injectable()
export class CityAdminService {
  constructor(private readonly db: PrismaService) {}

  /**
   * Create city
   *
   * @param dto
   * @returns
   */
  async create(dto: CreateCityAdminDto): Promise<City> {
    const isDuplicatedSlug = await this.db.city.findFirst({ where: { slug: dto.slug } });
    if (isDuplicatedSlug) throw new BadRequestException('CITY2');

    if (hasPersianLetter(dto.slug)) throw new UnprocessableEntityException('CITY3');

    const city = await this.db.city.create({ data: dto });
    return city;
  }

  /**
   * Update city
   *
   * @param cityId
   * @param dto
   * @returns
   */
  async update(cityId: number, dto: UpdateCityAdminDto): Promise<void> {
    const city = await this.db.city.findUnique({ where: { id: cityId } });
    if (!city) throw new NotFoundException('COMMON1');

    await this.db.city.update({ where: { id: cityId }, data: dto });
  }

  /**
   * Remove one
   *
   * @param {number} id
   * @returns
   */
  async remove(id: number): Promise<void> {
    await this.db.$transaction(async (tx) => {
      await tx.city.deleteMany({ where: { parent_id: id } });
      await tx.city.delete({ where: { id } });
    });
  }

  /**
   * Find all cities
   * @param filters
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(filters: object, page: number, perPage = 50): Promise<PaginatedResult<City>> {
    const list = await paginate()<City, Prisma.CityFindManyArgs>(
      this.db.city,
      {
        where: filters,
        include: {
          parent: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
      { page, perPage },
    );

    return list;
  }

  /**
   * Get all parents
   *
   * @returns
   */
  async findParents(ids?: number[], filters?: any): Promise<Array<City>> {
    //create query
    let query: Prisma.CityWhereInput = { parent_id: null };
    if (!isEmpty(ids)) query = { ...query, id: { in: ids } };
    if (filters) query = { ...query, ...filters };

    /**
     * If the city does not have a parent ID, it means that it is the parent city
     */
    const cities = await this.db.city.findMany({
      where: query,
      orderBy: { id: 'asc' },
    });

    return cities;
  }

  /**
   * Get all parent and childs - eager loading
   *
   * @returns
   */
  async findAllCascade(): Promise<Array<City>> {
    const cities = await this.db.city.findMany({
      /**
       * If the city does not have a parent ID, it means that it is the parent city
       */
      where: { parent_id: null },
      orderBy: [{ sort_order: { sort: 'asc', nulls: 'last' } }, { id: 'asc' }],
      include: {
        parent: true,
        image: true,
        child: {
          where: { deleted_at: null },
          orderBy: [{ sort_order: { sort: 'asc', nulls: 'last' } }, { id: 'asc' }],
          include: {
            image: true,
            child: {
              where: { deleted_at: null },
              orderBy: [{ sort_order: { sort: 'asc', nulls: 'last' } }, { id: 'asc' }],
            },
          },
        },
      },
    });

    return cities;
  }

  /**
   * Get Cities by parent id
   *
   * @param {number} parentId
   * @returns
   */
  async findChildren(parentId: number | null): Promise<Array<Partial<City>>> {
    /**
     * Unlike the findParents service, if a city has a parent ID, it means that it is a child city
     */
    const cities = await this.db.city.findMany({
      where: { parent_id: parentId },
      orderBy: { id: 'asc' },
      select: { id: true, title: true },
    });
    return cities;
  }

  /**
   * find cities that have not any children
   * @returns
   */
  async findLastLevels(): Promise<Array<RecursiveCity>> {
    const cities = await this.db.city.findMany({ where: { child: { none: {} } }, orderBy: { id: 'asc' } });

    const formattedCities = this.formatCityList(cities);
    return formattedCities;
  }

  /**
   * Find by id
   *
   * @param {number} cityId
   * @returns
   */
  async findById(cityId: number): Promise<City> {
    const city = await this.db.city.findUnique({ where: { id: cityId } });
    if (!city) throw new NotFoundException('NOT_FOUND');

    return city;
  }

  /**
   * Find One City
   *
   * @param {number} cityId
   * @returns
   */
  async findOne(cityId: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const city = await this.db.city.findUnique({ where: { id: cityId }, include: { image: true } });
    if (!city) throw new NotFoundException('NOT_FOUND');

    const showProps = showPropsBuilder(city);

    return { showProps };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   HELPER                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find model props
   * @param rbac
   * @returns
   */
  async findModelProps(): Promise<{
    createProps: Array<CreateProps>;
  }> {
    // PROPS
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

  async validateChildrenCities(parentId: number, ids: number[]): Promise<void> {
    // const intIds = [];
    // ids.map((e) => {
    //   if (isInteger(+e)) intIds.push(+e);
    // });
    // if (intIds.length != ids?.length) throw new BadRequestException('CATEGORY5');
    // const childrenCount = await this.db.city.count({
    //   where: { id: { in: ids }, parent_id: parentId, type: CityType.SPORT_CLUB },
    // });
    // if (childrenCount != ids?.length) throw new BadRequestException('CATEGORY5');
    // return intIds;
  }
}
