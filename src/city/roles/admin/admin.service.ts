import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { City } from '@prisma/client';
import { CreateCityDto } from 'src/city/dto/create-city.dto';

@Injectable()
export class CityAdminService {
  constructor(private readonly db: PrismaService) {}

  /**
   * Create city
   * Country has not any parent
   * @param dto
   * @returns
   */
  async create(dto: CreateCityDto): Promise<void> {
    await this.db.city.create({ data: dto });
    return;
  }

  /**
   * Find all cities
   * @returns
   */
  async findAll(): Promise<Array<Partial<City>>> {
    const cities = await this.db.city.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        title: true,
        parent_id: true,
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
    return cities;
  }

  async findOne(id: number): Promise<City> {
    const city = await this.db.city.findUnique({ where: { id }, include: { parent: true } });
    if (!city) throw new NotFoundException('COMMON1');
    return city;
  }

  /**
   * Update One City
   * @param id
   * @param dto
   * @returns
   */
  async updateOne(id: number, dto: CreateCityDto): Promise<void> {
    const city = await this.db.city.findUnique({ where: { id } });
    if (!city) throw new NotFoundException('COMMON1');
    // const { title, parent } = dto;
    await this.db.city.update({ where: { id }, data: dto });
    return;
  }
  /**
   * Remove one
   * @param id
   * @returns
   */
  async removeOne(id: number): Promise<void> {
    await this.db.city.delete({ where: { id } });
    return;
  }
}
