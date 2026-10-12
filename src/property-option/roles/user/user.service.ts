import { FindAllPropertyOptionUserDto } from './dto/find-all.dto';
import { localizeTitle } from 'src/common/helpers/title-translations.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { groupBy } from 'lodash';

@Injectable()
export class PropertyOptionUserService {
  constructor(private readonly db: PrismaService) {}

  async findAllByGroup(dto: FindAllPropertyOptionUserDto): Promise<any> {
    const list = await this.db.propertyOption.findMany({
      where: { group: { in: dto.group } },
      orderBy: { sort: 'asc' },
      select: { id: true, group: true, title: true, image: true, translations: true },
    });

    return groupBy(
      list.map((item) => localizeTitle(item, dto.locale)),
      'group',
    );
  }
}
