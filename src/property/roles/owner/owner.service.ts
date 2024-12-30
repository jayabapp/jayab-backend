import { Injectable, NotFoundException } from '@nestjs/common';
import { Property, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import { InProgressReserveStatus, PropertyStatuses } from 'src/property/common/property-status.type';
import { OptionConnect } from 'src/common/interfaces/option-connect.interface';
import { PropertyOptionGroup } from 'src/property-option/common/property-option-groups.type';
import { random } from 'lodash';
import { FindAllPropertyOwnerDto } from './dto/find-all.dto';
import { UpdatePropertyOwnerDto } from './dto/update.dto';
import { CreatePropertyOwnerDto } from './dto/create.dto';
import { UpdatePropertyStepOneOwnerDto } from './dto/update-property.dto';

@Injectable()
export class PropertyOwnerService {
  constructor(private readonly db: PrismaService) {}

  /**
   * Create a property with init status
   * If exist return this
   * @param ownerId
   * @returns
   */
  async findLastInitProp(ownerId: number): Promise<Property> {
    // const activeSubscription = await this.subscriptionService.findPlanByRole(user);
    // if (!activeSubscription) throw new NotAcceptableException('OWNER_SUB1');

    /* -------------------------------------------------------------------------- */
    // check the init property, if exist return this
    const initProp = await this.db.property.findFirst({
      where: { owner_id: ownerId, status: { in: InProgressReserveStatus } },
    });
    if (initProp) return initProp;

    /* -------------------------------------------------------------------------- */
    // property statistics
    // const propertyStatistics: PropertyStatisticType = {
    //   approved_rent: 0,
    //   approved_direct_rent: 0,
    //   approved_agreement: 0,
    //   approved_direct_agreement: 0,
    // };

    /* -------------------------------------------------------------------------- */
    // generate a random unique code
    let code: string;
    do {
      code = `${random(10_000, 99_999).toString()}`;
    } while (await this.db.property.findUnique({ where: { code } }));

    /* -------------------------------------------------------------------------- */
    // create new property
    const newProp = await this.db.property.create({
      data: { owner_id: ownerId, status: PropertyStatuses.INIT, code },
      // data: { owner_id: user.owner_id, status: PropertyStatuses.INIT, statistics: propertyStatistics },
    });

    return newProp;
  }

  /**
   * update init
   * @param property
   * @param dto
   * @returns
   */
  async updateInit(property: Property, dto: UpdatePropertyStepOneOwnerDto): Promise<void> {
    /* -------------------------------------------------------------------------- */
    // data without options
    let data: Prisma.PropertyUncheckedUpdateInput = {
      province_id: dto.province_id,
      region_id: dto.region_id || null,
      city_id: dto.city_id,
      title: dto.title,
      land_area: dto.land_area,
      building_area: dto.building_area,
      floors: dto.floors,
      floor: dto.floor,
      unit_per_floor: dto.unit_per_floor,
      construction_year: dto.construction_year,
      address: dto.address,
      is_chat_enabled: dto.is_chat_enabled,
      is_location_visible: dto.is_location_visible,
    };

    // do not update status in edit
    if (property.status == PropertyStatuses.INIT) data = { ...data, status: PropertyStatuses.IN_PROCESS };

    /* -------------------------------------------------------------------------- */
    // create options relations - delete old options
    const options: OptionConnect[] = await this.deleteAndCreateNewOption(property.id, dto, [
      PropertyOptionGroup.PROPERTY_TYPE,
      PropertyOptionGroup.OWNERSHIP,
      PropertyOptionGroup.BUILDING_DIRECTION,
    ]);

    /* -------------------------------------------------------------------------- */
    await this.db.property.update({
      where: { id: property.id },
      data: { ...data, property_options: { create: options } },
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all Property
   * @param dto
   * @returns
   */
  async findAll(dto: FindAllPropertyOwnerDto): Promise<CursorPaginatedResult<Property>> {
    const list = await cursorPaginate()<Property, Prisma.PropertyFindManyArgs>(
      this.db.property,
      {},
      { cursor: dto.cursor },
    );

    return list;
  }

  /**
   * find one property
   * @param propertyId
   * @returns
   */
  async findOne(propertyId: number, ownerId: number): Promise<Property> {
    const item = await this.db.property.findFirst({
      where: { id: propertyId, owner_id: ownerId },
    });

    if (!item) throw new NotFoundException('PROPERTY_NOT_FOUND');

    return item;
  }

  /**
   * update
   * @param propertyId
   * @param dto
   * @returns
   */
  async update(propertyId: number, dto: UpdatePropertyOwnerDto): Promise<Property> {
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

  /* -------------------------------------------------------------------------- */
  /*                                   HELPER                                   */
  /* -------------------------------------------------------------------------- */
  /**
   *
   * @param propertyId
   * @param dto
   * @param groups
   * @returns
   */
  async deleteAndCreateNewOption(
    propertyId: number,
    dto: any,
    groups: PropertyOptionGroup[],
  ): Promise<OptionConnect[]> {
    /* -------------------------------------------------------------------------- */
    // delete old records
    const a = await this.db.optionsOnProperty.deleteMany({
      where: {
        property_id: propertyId,
        option: {
          group: {
            in: groups,
          },
        },
      },
    });

    /* -------------------------------------------------------------------------- */
    // create new data
    let optionsQuery = [];
    for (const e of groups) {
      const data = dto[e.toLowerCase()];
      if (!data) continue;
      if (Array.isArray(data)) data.map((v) => optionsQuery.push({ option: { connect: { id: v } } }));
      else
        optionsQuery.push({
          option: { connect: { id: data } },
        });
    }

    return optionsQuery;
  }
}
