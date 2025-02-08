import { Injectable } from '@nestjs/common';
import { PropertyOption } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllPropertyOptionUserDto } from './dto/find-all.dto';
import { groupBy } from 'lodash';

@Injectable()
export class PropertyOptionUserService {
  constructor(private readonly db: PrismaService) {}

  /**
   * find all PropertyOption
   * @param dto
   * @returns
   */
  async findAllByGroup(dto: FindAllPropertyOptionUserDto): Promise<any> {
    const list = await this.db.propertyOption.findMany({
      where: { group: { in: dto.group } },
      orderBy: { sort: 'asc' },
      select: { id: true, group: true, title: true, image: true },
    });

    return groupBy(list, 'group');
  }
}
