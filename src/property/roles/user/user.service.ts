import { Injectable, NotFoundException } from "@nestjs/common";
import { Property, Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CreatePropertyUserDto } from "./dto/create.dto";
import { UpdatePropertyUserDto } from "./dto/update.dto";
import { FindAllPropertyUserDto } from "./dto/find-all.dto";
import {
  type CursorPaginatedResult,
  cursorPaginate,
} from "src/common/helpers/cursor-paginator";

@Injectable()
export class PropertyUserService {
  constructor(private readonly db: PrismaService) {}

  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreatePropertyUserDto): Promise<Property> {
    const newProperty = await this.db.property.create({ data: dto });
    return newProperty;
  }

  /**
   * find all Property
   * @param dto
   * @returns
   */
  async findAll(dto: FindAllPropertyUserDto): Promise<CursorPaginatedResult<Property>> {
    const list = await cursorPaginate()<Property, Prisma.PropertyFindManyArgs>(
      this.db.property,
      {},
      { cursor: dto.cursor }
    );

    return list;
  }

  /**
   * find one property
   * @param propertyId
   * @returns
   */
  async findOne(propertyId: number): Promise<Property> {
    const item = await this.db.property.findFirst({
      where: { id: propertyId },
    });

    if (!item) throw new NotFoundException("NOT_FOUND");

    return item;
  }

  /**
   * update
   * @param propertyId
   * @param dto
   * @returns
   */
  async update(propertyId: number, dto: UpdatePropertyUserDto): Promise<Property> {
    const item = await this.db.property.update({
      where: { id: propertyId },
      data: dto,
    });

    return item;
  }

  // /**
  //  * remove
  //  * @param propertyId
  //  */
  // async remove(propertyId: number): Promise<void> {
  //   await this.db.property.delete({ where: { id: propertyId } });
  // }
}
