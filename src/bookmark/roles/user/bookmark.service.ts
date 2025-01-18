import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookmarkUserDto } from './dto/create.dto';

@Injectable()
export class BookmarkUserService {
  constructor(private readonly db: PrismaService) {}
  /**
   * create
   * @param dto
   * @returns
   */
  async createOrDelete(userId: number, dto: CreateBookmarkUserDto): Promise<number[]> {
    const isBookmarked = await this.db.bookmark.findFirst({
      where: { user_id: userId, property_id: dto.property_id },
    });

    if (isBookmarked) await this.db.bookmark.delete({ where: { id: isBookmarked.id } });
    else await this.db.bookmark.create({ data: { user_id: userId, property_id: dto.property_id } });

    const ids = this.findAllIds(userId);
    return ids;
  }

  /**
   *
   * @param userId
   * @returns
   */
  async findAllIds(userId: number): Promise<number[]> {
    const ids = (await this.db.bookmark.findMany({ where: { user_id: userId } })).map((e) => e.property_id);
    return ids;
  }
}
