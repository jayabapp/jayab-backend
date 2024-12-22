import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilterCategoryUserDto } from './dto/filter-category-user.dto';
import { isEmpty } from 'lodash';

@Injectable()
export class CategoryUserService {
  constructor(private readonly db: PrismaService) {}

  /**
   * Find all children categories of a parent for home page.
   *
   * @param {number} parentId
   * @returns
   */
  async findAll(parentId: number): Promise<Partial<Category>[]> {
    const result = await this.db.category.findMany({
      where: { parent_id: parentId, is_active: true },
      select: {
        id: true,
        sort_order: true,
        title: true,
        hex_color: true,
        image: true,
        path: true,
        parent: { select: { title: true } },
      },
      orderBy: { sort_order: { sort: 'asc', nulls: 'last' } },
    });

    return result;
  }

  async findAllRecursively(): Promise<Partial<Category>[]> {
    const result = await this.db.category.findMany({
      where: { is_active: true, parent_id: null },
      select: {
        id: true,
        title: true,
        image: true,
        parent_id: true,
        path: true,
        children: {
          where: { is_active: true, deleted_at: null },
          orderBy: { sort_order: { sort: 'asc', nulls: 'last' } },
          select: {
            id: true,
            title: true,
            image: true,
            parent_id: true,
            path: true,
            children: {
              where: { is_active: true, deleted_at: null },
              orderBy: { sort_order: { sort: 'asc', nulls: 'last' } },
              select: { id: true, title: true, path: true, parent_id: true, image: true },
            },
          },
        },
      },
      orderBy: { sort_order: { sort: 'asc', nulls: 'last' } },
    });

    return result;
  }

  /**
   * Find all children categories of a parent
   *
   * @param {number} parentId
   * @returns
   */
  async findAllChildren(parentId: number): Promise<Partial<Category>[]> {
    const result = await this.db.category.findMany({
      where: { parent_id: parentId },
      select: { id: true, title: true, is_active: true, path: true },
      orderBy: { sort_order: { sort: 'asc', nulls: 'last' } },
    });

    return result;
  }

  /**
   * filter
   * @param dto
   * @returns
   */
  async filter(dto: FilterCategoryUserDto): Promise<Partial<Category>[]> {
    if (isEmpty(Object.keys(dto))) return [];

    const result = await this.db.category.findMany({
      where: { ...dto, is_active: true },
      include: { image: true, parent: true },
      orderBy: { sort_order: { sort: 'asc', nulls: 'last' } },
    });

    return result;
  }

  /**
   * Find One Category
   * @param id
   * @param dto
   * @returns
   */
  async findById(
    id: number,
  ): Promise<Category & { parent: Category & { parent: Category & { parent: Category } } }> {
    const category = await this.db.category.findUnique({
      where: { id },
      include: { image: true, parent: { include: { parent: { include: { parent: true } } } } },
    });
    if (!category) throw new NotFoundException('NOT_FOUND');
    return category;
  }

  /**
   * Get all parents
   *
   * @returns
   */
  async findParents(): Promise<Array<Partial<Category>>> {
    const categories = await this.db.category.findMany({
      /**
       * If the category does not have a parent ID, it means that it is the parent category
       */
      where: { parent_id: null },
      orderBy: { sort_order: { sort: 'asc', nulls: 'last' } },
      select: {
        id: true,
        title: true,
        key: true,
        is_active: true,
        image: true,
        hex_color: true,
        path: true,
      },
    });

    return categories;
  }

  /**
   * Find by title
   *
   * @param {string} title
   * @returns
   */
  async findByTitle(title: string): Promise<Category> {
    const category = await this.db.category.findFirst({ where: { title } });
    return category;
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
}
