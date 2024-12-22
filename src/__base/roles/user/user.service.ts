import { Injectable, NotFoundException } from "@nestjs/common";
import { Base, Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateBaseUserDto } from "./dto/create.dto";
import { UpdateBaseUserDto } from "./dto/update.dto";
import { FindAllBaseUserDto } from "./dto/find-all.dto";
import {
  type CursorPaginatedResult,
  cursorPaginate,
} from "src/common/helpers/cursor-paginator";

@Injectable()
export class BaseUserService {
  constructor(private readonly db: PrismaService) {}

  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreateBaseUserDto): Promise<Base> {
    const newBase = await this.db.base.create({ data: dto });
    return newBase;
  }

  /**
   * find all Base
   * @param dto
   * @returns
   */
  async findAll(dto: FindAllBaseUserDto): Promise<CursorPaginatedResult<Base>> {
    const list = await cursorPaginate()<Base, Prisma.BaseFindManyArgs>(
      this.db.base,
      {},
      { cursor: dto.cursor }
    );

    return list;
  }

  /**
   * find one base
   * @param baseId
   * @returns
   */
  async findOne(baseId: number): Promise<Base> {
    const item = await this.db.base.findFirst({
      where: { id: baseId },
    });

    if (!item) throw new NotFoundException("NOT_FOUND");

    return item;
  }

  /**
   * update
   * @param baseId
   * @param dto
   * @returns
   */
  async update(baseId: number, dto: UpdateBaseUserDto): Promise<Base> {
    const item = await this.db.base.update({
      where: { id: baseId },
      data: dto,
    });

    return item;
  }

  // /**
  //  * remove
  //  * @param baseId
  //  */
  // async remove(baseId: number): Promise<void> {
  //   await this.db.base.delete({ where: { id: baseId } });
  // }
}
