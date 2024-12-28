import { Injectable, NotFoundException } from '@nestjs/common';
import { Advisor, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdvisorUserDto } from './dto/create.dto';
import { UpdateAdvisorUserDto } from './dto/update.dto';
import { FindAllAdvisorUserDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';

@Injectable()
export class AdvisorUserService {
  constructor(private readonly db: PrismaService) {}

  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreateAdvisorUserDto): Promise<Advisor> {
    const newAdvisor = await this.db.advisor.create({ data: dto });
    return newAdvisor;
  }

  /**
   * find all Advisor
   * @param dto
   * @returns
   */
  async findAll(dto: FindAllAdvisorUserDto): Promise<CursorPaginatedResult<Advisor>> {
    const list = await cursorPaginate()<Advisor, Prisma.AdvisorFindManyArgs>(
      this.db.advisor,
      {},
      { cursor: dto.cursor },
    );

    return list;
  }

  /**
   * find one advisor
   * @param advisorId
   * @returns
   */
  async findOne(advisorId: number): Promise<Advisor> {
    const item = await this.db.advisor.findFirst({
      where: { id: advisorId },
    });

    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
  }

  /**
   * find one by national code
   * @param nationalCode
   * @returns
   */
  async findOneByNationalCode(nationalCode: string): Promise<Advisor> {
    const item = await this.db.advisor.findUnique({ where: { national_code: nationalCode } });
    return item;
  }

  /**
   * update
   * @param advisorId
   * @param dto
   * @returns
   */
  async update(advisorId: number, dto: UpdateAdvisorUserDto): Promise<Advisor> {
    const item = await this.db.advisor.update({
      where: { id: advisorId },
      data: dto,
    });

    return item;
  }

  // /**
  //  * remove
  //  * @param advisorId
  //  */
  // async remove(advisorId: number): Promise<void> {
  //   await this.db.advisor.delete({ where: { id: advisorId } });
  // }
}
