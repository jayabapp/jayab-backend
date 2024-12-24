import { Injectable, NotFoundException } from "@nestjs/common";
import { Owner, Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateOwnerUserDto } from "./dto/create.dto";
import { UpdateOwnerUserDto } from "./dto/update.dto";
import { FindAllOwnerUserDto } from "./dto/find-all.dto";
import {
  type CursorPaginatedResult,
  cursorPaginate,
} from "src/common/helpers/cursor-paginator";

@Injectable()
export class OwnerUserService {
  constructor(private readonly db: PrismaService) {}

  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreateOwnerUserDto): Promise<Owner> {
    const newOwner = await this.db.owner.create({ data: dto });
    return newOwner;
  }

  /**
   * find all Owner
   * @param dto
   * @returns
   */
  async findAll(dto: FindAllOwnerUserDto): Promise<CursorPaginatedResult<Owner>> {
    const list = await cursorPaginate()<Owner, Prisma.OwnerFindManyArgs>(
      this.db.owner,
      {},
      { cursor: dto.cursor }
    );

    return list;
  }

  /**
   * find one owner
   * @param ownerId
   * @returns
   */
  async findOne(ownerId: number): Promise<Owner> {
    const item = await this.db.owner.findFirst({
      where: { id: ownerId },
    });

    if (!item) throw new NotFoundException("NOT_FOUND");

    return item;
  }

  /**
   * update
   * @param ownerId
   * @param dto
   * @returns
   */
  async update(ownerId: number, dto: UpdateOwnerUserDto): Promise<Owner> {
    const item = await this.db.owner.update({
      where: { id: ownerId },
      data: dto,
    });

    return item;
  }

  // /**
  //  * remove
  //  * @param ownerId
  //  */
  // async remove(ownerId: number): Promise<void> {
  //   await this.db.owner.delete({ where: { id: ownerId } });
  // }
}
