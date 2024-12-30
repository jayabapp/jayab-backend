import { Injectable } from '@nestjs/common';
import { PropertyOption } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllPropertyOptionUserDto } from './dto/find-all.dto';

@Injectable()
export class PropertyOptionUserService {
  constructor(private readonly db: PrismaService) {}

  /**
   * find all PropertyOption
   * @param dto
   * @returns
   */
  async findAllByGroup(dto: FindAllPropertyOptionUserDto): Promise<Partial<PropertyOption>[]> {
    const list = await this.db.propertyOption.findMany({
      where: { group: dto.group },
      orderBy: { sort: 'asc' },
      select: { id: true, title: true },
    });

    return list;
  }
}
