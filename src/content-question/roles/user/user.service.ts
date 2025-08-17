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
   * پرسش های متصل به محتوا
   * متصل به دسته بندی محتوا
   * یا برای  کل یک دسته بندی محتوا مثلا همه پرسش های مربوط به بلاگ
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(dto: FindAllContentQuestionUserDto): Promise<PaginatedResult<ContentQuestion>> {
    let q: Prisma.ContentQuestionWhereInput = { is_publish: true };
    if (dto.content_id) q = { ...q, content_id: dto.content_id };
    else if (dto.content_key) q = { ...q, content: { key: dto.content_key } };
    else if (dto.content_category_id) q = { ...q, content_category_id: dto.content_category_id };
    else if (dto.content_parent_category_id)
      q = {
        ...q,
        content: {
          OR: [
            { category_id: dto.content_parent_category_id },
            { category: { parent_id: dto.content_parent_category_id } },
          ],
        },
      };

    const list = paginate()<ContentQuestion, Prisma.ContentQuestionFindManyArgs>(
      this.db.contentQuestion,
      {
        where: q,
        include: { image: true },
        omit: { mobile_number: true, admin_id: true, content_id: true, content_category_id: true },
      },
      { page: dto.page, perPage: dto.per_page },
    );

    return list;
  }
}
