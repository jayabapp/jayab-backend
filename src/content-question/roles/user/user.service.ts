import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentQuestion, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContentQuestionUserDto } from './dto/create.dto';
import { PaginatedResult, paginate } from 'src/common/helpers/paginator';
import { FindAllContentQuestionUserDto } from './dto/find-all.dto';

@Injectable()
export class ContentQuestionUserService {
  constructor(private readonly db: PrismaService) {}

  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreateContentQuestionUserDto): Promise<ContentQuestion> {
    const newContentQuestion = await this.db.contentQuestion.create({ data: dto });
    return newContentQuestion;
  }

  /**
   * find all ContentQuestion
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(dto: FindAllContentQuestionUserDto): Promise<PaginatedResult<ContentQuestion>> {
    const list = paginate()<ContentQuestion, Prisma.ContentQuestionFindManyArgs>(
      this.db.contentQuestion,
      { where: { content_id: dto.content_id, is_publish: true }, include: { image: true } },
      { page: dto.page, perPage: dto.per_page },
    );

    return list;
  }

  /**
   * find many
   * this method used for selectable lists with less than 50 items
   * @returns
   */
  async findMany(): Promise<ContentQuestion[]> {
    const list = await this.db.contentQuestion.findMany();
    return list;
  }

  /**
   * remove
   * @param contentQuestionId
   */
  async remove(contentQuestionId: number): Promise<void> {
    await this.db.contentQuestion.delete({ where: { id: contentQuestionId } });
  }
}
