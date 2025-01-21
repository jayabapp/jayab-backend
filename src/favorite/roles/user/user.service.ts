import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFavoriteUserDto } from './dto/create.dto';

@Injectable()
export class FavoriteUserService {
  constructor(private readonly db: PrismaService) {}
  /**
   * create
   * @param dto
   * @returns
   */
  async createOrDelete(userId: number, dto: CreateFavoriteUserDto): Promise<number[]> {
    const isFav = await this.db.favorite.findFirst({
      where: { user_id: userId, property_id: dto.property_id },
    });

    await this.db.$transaction(async (tx) => {
      if (isFav) await tx.favorite.delete({ where: { id: isFav.id } });
      else await tx.favorite.create({ data: { user_id: userId, property_id: dto.property_id } });

      await tx.property.update({
        where: { id: dto.property_id },
        data: { favorite_count: { increment: isFav ? -1 : 1 } },
      });
    });

    const ids = this.findAllIds(userId);
    return ids;
  }

  // /**
  //  * find all Favorite
  //  * @param dto
  //  * @returns
  //  */
  // async findAll(
  //   userId: number,
  //   dto: FindAllFavoriteUserDto,
  // ): Promise<CursorPaginatedResult<FavoriteResType>> {
  //   const list = await cursorPaginate()<FavoriteJsonType, Prisma.FavoriteFindManyArgs>(
  //     this.db.favorite,
  //     {
  //       where: { user_id: userId },
  //       orderBy: { created_at: 'desc' },
  //     },
  //     { cursor: dto.cursor },
  //   );

  //   const serialized = FavoriteSerializer.toArray(list.data);

  //   return { data: serialized };
  // }

  /**
   *
   * @param userId
   * @returns
   */
  async findAllIds(userId: number): Promise<number[]> {
    const ids = (await this.db.favorite.findMany({ where: { user_id: userId } })).map((e) => e.property_id);
    return ids;
  }
}
