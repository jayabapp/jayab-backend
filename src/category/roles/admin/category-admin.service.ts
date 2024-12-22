import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryAdminDto } from './dto/create-category-admin.dto';
import { UpdateCategoryAdminDto } from './dto/update-category-admin.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Category, Prisma } from '@prisma/client';
import { createPropsBuilder, showPropsBuilder } from 'src/category/common/helpers/model-props-builder.helper';
import { CreateProps, ShowAction, ShowProps } from 'src/common/interfaces/model-props.interface';
import { isEmpty, isInteger } from 'lodash';
import { PaginatedResult, paginate } from 'src/common/helpers/paginator';
import { FindAllCategoryAdminDto } from './dto/find-all.dto';

export type RecursiveCategory = Category & { parent: RecursiveCategory | null };

@Injectable()
export class CategoryAdminService {
  constructor(private readonly db: PrismaService) {}

  /**
   * Create category
   *
   * @param {CreateCategoryAdminDto} createCategoryAdminDto
   * @returns
   */
  async create(createCategoryAdminDto: CreateCategoryAdminDto): Promise<void> {
    await this.db.$transaction(async (tx) => {
      const result = await tx.category.create({ data: { ...createCategoryAdminDto, path: '' } });
      let path = '';
      if (createCategoryAdminDto.parent_id) {
        const parent = await this.db.category.findFirst({ where: { id: createCategoryAdminDto.parent_id } });
        path = `${parent.path}${result.id}-`;
      } else path = `-${result.id}-`;

      await tx.category.update({ where: { id: result.id }, data: { path } });
    });
    return;
  }

  /**
   * Update category
   *
   * @param {number} categoryId
   * @param {UpdateCategoryAdminDto} updateCategoryAdminDto
   * @returns
   */
  async update(categoryId: number, updateCategoryAdminDto: UpdateCategoryAdminDto): Promise<Category> {
    const result = await this.db.category.update({ where: { id: categoryId }, data: updateCategoryAdminDto });
    return result;
  }

  /**
   * Remove one
   *
   * @param {number} id
   * @returns
   */
  async remove(id: number): Promise<void> {
    await this.db.$transaction(async (tx) => {
      const category = await tx.category.delete({ where: { id } });

      const list = await tx.category.findMany({
        where: { path: { contains: `-${id}-` } },
      });

      //update path and parent for childrens
      for (const e of list) {
        let updateData: Prisma.CategoryUncheckedUpdateInput = { path: e.path.replace(`${id}-`, '') };
        if (e.parent_id == id) updateData = { ...updateData, parent_id: category.parent_id };
        await tx.category.update({ where: { id: e.id }, data: updateData });
      }
    });

    return;
  }

  /**
   * Find all categories
   * @param filters
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(dto: FindAllCategoryAdminDto): Promise<Category[]> {
    const list = await this.db.category.findMany({ where: { title: { contains: dto.title } } });
    return list;
  }
  /**
   * Get all parents
   *
   * @returns
   */
  async findParents(ids?: number[], dto?: FindAllCategoryAdminDto): Promise<Array<Category>> {
    //create query
    let query: Prisma.CategoryWhereInput = { parent_id: null };
    if (!isEmpty(ids)) query = { ...query, id: { in: ids } };
    if (dto?.title) query = { ...query, title: { contains: dto.title, mode: 'insensitive' } };

    /**
     * If the category does not have a parent ID, it means that it is the parent category
     */
    const categories = await this.db.category.findMany({
      where: query,
      orderBy: { id: 'asc' },
    });

    return categories;
  }

  /**
   * Get all parent and childs - eager loading
   *
   * @returns
   */
  async findAllCascade(): Promise<Array<Category>> {
    const categories = await this.db.category.findMany({
      /**
       * If the category does not have a parent ID, it means that it is the parent category
       */
      where: { parent_id: null },
      orderBy: [{ sort_order: { sort: 'asc', nulls: 'last' } }, { id: 'asc' }],
      include: {
        image: true,
        parent: true,
        children: {
          where: { deleted_at: null },
          orderBy: { sort_order: { sort: 'asc', nulls: 'last' } },
          include: {
            image: true,
            children: {
              where: { deleted_at: null },
              orderBy: { sort_order: { sort: 'asc', nulls: 'last' } },
              include: {
                image: true,
                children: {
                  where: { deleted_at: null },
                  orderBy: { sort_order: { sort: 'asc', nulls: 'last' } },
                  include: {
                    image: true,
                    children: {
                      where: { deleted_at: null },
                      orderBy: { sort_order: { sort: 'asc', nulls: 'last' } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return categories;
  }

  /**
   * Get Categories by parent id
   *
   * @param {number} parentId
   * @returns
   */
  async findChildren(parentId: number | null): Promise<Array<Partial<Category>>> {
    /**
     * Unlike the findParents service, if a category has a parent ID, it means that it is a child category
     */
    const categories = await this.db.category.findMany({
      where: { parent_id: parentId },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        title: true,
        is_active: true,
        image: true,
      },
    });
    return categories;
  }

  /**
   * find categories that have not any children
   * @returns
   */
  async findLastLevels(): Promise<Array<RecursiveCategory>> {
    const categories = await this.db.category.findMany({
      where: { children: { none: {} } },
      orderBy: { id: 'asc' },
      include: {
        image: true,
        parent: { include: { parent: { include: { parent: { include: { parent: true } } } } } },
      },
    });

    const formattedCategories = this.formatCategoryList(categories);
    return formattedCategories;
  }

  /**
   * Find by id
   *
   * @param {number} categoryId
   * @returns
   */
  async findById(categoryId: number): Promise<Category & { parent: Category; children: Category[] }> {
    const category = await this.db.category.findUnique({
      where: { id: categoryId },
      include: { parent: true, children: true, image: true },
    });
    if (!category) throw new NotFoundException('NOT_FOUND');

    return category;
  }

  /**
   * Find One Category
   *
   * @param {number} categoryId
   * @returns
   */
  async findOne(categoryId: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const category = await this.db.category.findUnique({
      where: { id: categoryId },
      include: { parent: true, image: true },
    });
    if (!category) throw new NotFoundException('NOT_FOUND');

    const showProps = showPropsBuilder(category);

    return { showProps };
  }

  /**
   * Find by key
   *
   * @param key
   * @returns
   */
  async findByKey(key: string): Promise<Category> {
    const category = await this.db.category.findUnique({ where: { key } });
    if (!category) throw new NotFoundException('NOT_FOUND');

    return category;
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

  formatCategoryList(categories: Category[]): any {
    const formattedCategories: { id: number; title: string }[] = [];
    for (const cat of categories as Array<RecursiveCategory>) {
      const titles = [cat.title];
      let parent = cat.parent;
      while (!isEmpty(parent)) {
        titles.push(parent.title);
        parent = parent.parent;
      }
      formattedCategories.push({ id: cat.id, title: titles.reverse().join(' -> ') });
    }
    return formattedCategories;
  }

  async validateParentCategories(ids: number[]): Promise<number[]> {
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
