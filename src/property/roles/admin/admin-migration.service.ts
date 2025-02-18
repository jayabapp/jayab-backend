import { Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, Property, Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateProps,
  OperatorItems,
  ShowAction,
  ShowProps,
  TableProps,
} from 'src/common/interfaces/model-props.interface';
import { operatorsList } from 'src/common/utils/constants/filter-operators.constant';
import { type PaginatedResult, paginate } from 'src/common/helpers/paginator';
import {
  allActionsBuilder,
  createPropsBuilder,
  filterPropsBuilder,
  showActionBuilder,
  showPropsBuilder,
  tablePropsBuilder,
} from 'src/property/common/helpers/model-props-builder.helper';
import { UpdatePartialPropertyAdminDto } from './dto/update-partial.dto';
import { startOfDate, startOfToday } from 'src/common/helpers/date.helper';
import moment from 'moment-jalaali';
import { DayHelper } from 'src/common/helpers/day.helper';
import {
  PropertyArrayResType,
  PropertyJsonType,
  PropertySerializer,
} from 'src/property/serializer/property.serializer';
import { PropertyStatusesList } from 'src/property/common/types/property-status.type';
import { AdminDescription } from 'src/common/interfaces/admin-description.type';
import { AdminType } from 'src/common/interfaces/user.interface';
import { ExcelCol, saveToExcel, SHEET_NAME } from 'src/common/helpers/excel-creator.helper';
import { JALAALI_FORMAT } from 'src/common/utils/constants/date.constant';
import { UpdatePropertyImagesAdminDto } from './dto/update.dto';
import { PrismaService2 } from 'src/prisma/prisma.service2';

@Injectable()
export class PropertyAdminMigrationService {
  constructor(
    private readonly db: PrismaService,
    private readonly dbv1: PrismaService2,
    private readonly dayHelper: DayHelper,
    private readonly propertySerializer: PropertySerializer,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                              MIGRATE JAYAB V1                              */
  /* -------------------------------------------------------------------------- */
  /**
   * migrate jayab v1 data to v2
   * @param id
   */
  async migrateFromV1Users(): Promise<void> {
    const users = await this.dbv1.user.findMany();
    for (const user of users) {
      await this.db.user.upsert({
        where: { mobile_number: user.mobile_number },
        create: {
          mobile_number: user.mobile_number,
          notification_read_at: new Date(),
        },
        update: {},
      });
    }
    console.log({ users });
  }

  async migrateFromV1Owners(): Promise<void> {
    const owners = await this.dbv1.owner.findMany();
    // for (const owner of owners) {
    //   await this.db.user.upsert({
    //     where: { mobile_number: user.mobile_number },
    //     create: {
    //       mobile_number: user.mobile_number,
    //       notification_read_at: new Date(),
    //     },
    //     update: {},
    //   });
    // }
    console.log({ owners });
  }

  async migrateFromV1Attachments(): Promise<void> {
    const attachments = await this.dbv1.attachment.findMany({ take: 1 });
    // for (const owner of owners) {
    //   await this.db.user.upsert({
    //     where: { mobile_number: user.mobile_number },
    //     create: {
    //       mobile_number: user.mobile_number,
    //       notification_read_at: new Date(),
    //     },
    //     update: {},
    //   });
    // }
    console.log({ attachments });
  }
}
