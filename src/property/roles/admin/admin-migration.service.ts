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
import { PropertyStatuses, PropertyStatusesList } from 'src/property/common/types/property-status.type';
import { AdminDescription } from 'src/common/interfaces/admin-description.type';
import { AdminType } from 'src/common/interfaces/user.interface';
import { ExcelCol, saveToExcel, SHEET_NAME } from 'src/common/helpers/excel-creator.helper';
import { JALAALI_FORMAT } from 'src/common/utils/constants/date.constant';
import { UpdatePropertyImagesAdminDto } from './dto/update.dto';
import { PrismaService2 } from 'src/prisma/prisma.service2';
import { AttachmentService } from 'src/attachment/attachment.service';
import fs from 'fs/promises';
import { __baseDir } from 'src/config/settings';
import {
  IMAGES_OWNER_PROPERTY_FOLDER,
  IMAGES_PROFILE_FOLDER,
  PROFILE_FOLDER,
} from 'src/common/utils/constants/storage-folders';
import { ConfigService } from '@nestjs/config';
import { UserRole } from 'src/common/interfaces/role.enum';
import { S3ManagerService } from 'src/s3-manager/s3-manager.service';
import { OwnerStatus } from 'src/owner/common/owner-status.type';
import { slugify } from 'src/common/helpers/slugify';
import { omit } from 'lodash';

@Injectable()
export class PropertyAdminMigrationService {
  constructor(
    private readonly db: PrismaService,
    private readonly dbv1: PrismaService2,
    private readonly dayHelper: DayHelper,
    private readonly propertySerializer: PropertySerializer,
    private readonly attachmentService: AttachmentService,
    private config: ConfigService,
    private s3Manager: S3ManagerService,
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
    const owners = await this.dbv1.owner.findMany({ include: { user: { select: { id: true } } } });
    for (const owner of owners) {
      const user = owner.user;
      console.log({ ownerId: owner.id, userId: user.id });

      if (!user) continue;
      await this.db.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: {
            owner: { create: { id: owner.id, national_code: '1111111111', status: OwnerStatus.APPROVED } },
            full_name: owner.full_name,
            profile_image: { connect: { id: owner.profile_image_id } },
          },
        });
      });
    }
    // console.log({ owners });
  }

  async migrateFromV1Options(): Promise<void> {
    const options = await this.dbv1.propertyOption.findMany({});
    for (const opt of options) {
      console.log({ opt });
      await this.db.propertyOption.upsert({
        where: { id: opt.id },
        create: opt,
        update: {},
      });
    }
  }

  async migrateFromV1Cities(): Promise<void> {
    const cities = await this.dbv1.city.findMany({ orderBy: { id: 'asc' } });
    for (const city of cities) {
      console.log({ city });
      await this.db.city.upsert({
        where: { id: city.id },
        create: city,
        update: {},
      });
    }
  }

  async migrateFromV1Properties(): Promise<void> {
    const properties = await this.dbv1.property.findMany({
      where: { status_step: 30 },
      include: {
        bedrooms: true,
        daily_price: true,
        description: true,
        status: true,
        temp_attachments: true,
        attachments: true,
        property_options: true,
        owner: { include: { user: true } },
      },
      orderBy: { id: 'asc' },
    });
    for (const prop of properties) {
      const optionsArray = prop.property_options.map((opt) => opt.option_id);

      const newProp = await this.db.property.findFirst({ where: { id: prop.id } });
      if (newProp) continue;

      await this.db.$transaction(
        async (tx) => {
          const p = await tx.property.create({
            data: {
              code: `${prop.code}`,
              owner: { connect: { id: prop.owner_id } },
              title: prop.title,
              slug: `${prop.code}-${slugify(prop.title)}`,
              land_area: prop.land_area,
              building_area: prop.building_area,
              floors: prop.floors,
              unit_per_floor: prop.unit_per_floor,
              floor: prop.floor,
              construction_year: prop.construction_year,
              // region: { connect: { id: prop.region_id } },
              city: { connect: { id: prop.city_id } },
              province: { connect: { id: prop.province_id } },
              address: prop.address,
              lat: prop.lat,
              lng: prop.lng,
              // feature_image: { connect: { id: prop.feature_image_id } },
              // video_id: prop.video_id,
              is_chat_enabled: true,
              is_location_visible: true,
              has_pool: prop.has_pool,
              std_capacity: prop.std_capacity,
              max_capacity: prop.max_capacity,
              canceling_type: prop.canceling_type,
              advisor_commission: prop.advisor_commission,
              check_in_hour: '14',
              check_out_hour: '12',
              subscription_expired_at: startOfDate(moment().add(30, 'days').toDate()),
              sort_order: moment(prop.updated_at).unix(),
              contact_type: 1,
              status: prop.status_step || 20,
              admin_descriptions: [],
              is_authorized: false,
              has_blue_tick: false,
              options_array: optionsArray,
              bedrooms: { create: omit(prop.bedrooms, ['id', 'property_id']) },
              daily_price: { create: omit(prop.daily_price, ['id', 'property_id']) },
              description: { create: omit(prop.description, ['id', 'property_id']) },
              assistants: {
                create: {
                  is_owner: true,
                  assistant_mobile_number: prop.owner.user.mobile_number,
                  assistant_full_name: prop.owner.full_name,
                },
              },
              created_at: prop.created_at,
              updated_at: prop.updated_at,
            },
            // update: {},
          });
          const x: Prisma.OptionsOnPropertyUncheckedCreateInput[] = [];
          for (const opt of prop.property_options) {
            if (await tx.propertyOption.findFirst({ where: { id: opt.option_id } })) {
              x.push({
                property_id: p.id,
                option_id: opt.option_id,
                assigned_at: new Date(),
              });
            }
          }

          let y = [];
          for (const att of prop.attachments) {
            if (await tx.attachment.findFirst({ where: { id: att.id } })) {
              y.push({ id: att.id });
            }
          }

          let z = [];
          for (const att of prop.temp_attachments) {
            if (await tx.attachment.findFirst({ where: { id: att.id } })) {
              z.push({ id: att.id });
            }
          }

          let xprime;
          if (await tx.attachment.findFirst({ where: { id: prop.feature_image_id } }))
            xprime = { id: prop.feature_image_id };

          await tx.property.update({
            where: { id: p.id },
            data: {
              attachments: { connect: y },
              temp_attachments: { connect: z },
              feature_image: { connect: xprime },
            },
          });
          console.log({ p: p.id, x });
          await tx.optionsOnProperty.createMany({
            data: x,
          });
        },
        { timeout: 20000 },
      );
    }
  }

  async migrateFromV1Attachments(): Promise<void> {
    const attachments = await this.dbv1.attachment.findMany({
      where: { property: { some: {} } },
      // where: { owner: { some: {} } },
      // take: 10,
      orderBy: { id: 'asc' },
    });
    for (const attachment of attachments) {
      console.log({ id: attachment.id });

      const isExist = await this.db.attachment.findFirst({ where: { name: attachment.name } });
      if (isExist) continue;

      const fileName = attachment.name;

      const path = __baseDir + '/storage/v1/images/' + fileName;
      const isFileExist = await this.fileExists(path);
      if (!isFileExist) continue;

      await fs.copyFile(
        __baseDir + '/storage/v1/images/' + fileName,
        __baseDir + '/storage/v1/images_3/' + fileName,
      );
      await fs.copyFile(
        __baseDir + '/storage/v1/images/' + fileName,
        __baseDir + '/storage/v1/images_3/' + `medium-v1-${fileName}`,
      );
      await fs.copyFile(
        __baseDir + '/storage/v1/images/' + `thumbnail-${fileName}`,
        __baseDir + '/storage/v1/images_3/' + `thumbnail-${fileName}`,
      );

      await this.db.attachment.create({
        data: {
          id: attachment.id,
          name: fileName,
          medium: `medium-v1-${fileName}`,
          thumbnail: `thumbnail-${fileName}`,
          bucket: this.config.get('aws.bucket'),
          end_point: this.config.get('aws.fs1.endPoint'),
          alt: '',
          type: 1,
          user_id: attachment.user_id || null,
          user_role: UserRole.OWNER,
          // path: IMAGES_OWNER_PROPERTY_FOLDER,
          path: PROFILE_FOLDER,
        },
      });

      // const fileName = attachment.name;
      // const file = await fs.readFile(__baseDir + '/storage/v1/' + fileName);
      // console.log({ file });
      // const args = {
      //   fileName,
      //   file,
      //   folder: IMAGES_OWNER_PROPERTY_FOLDER,
      //   userId: attachment.user_id || null,
      // };
      // const result = await this.attachmentService.createAttachmentInMigration(args);
      // console.log({ result });
    }
    // console.log({ attachments });
  }

  async convertToWebp(): Promise<void> {
    const path = __baseDir + '/storage/v1/images_3/';

    const files = await fs.readdir(path);

    // for (const file of files) {
    //   if (file.startsWith('thumb')) {
    //     const filePath = path + file;
    //     await fs.unlink(filePath);
    //     console.log(`Deleted: ${file}`);
    //   }
    // }

    // return;
    let counter = files.length;
    for (const file of files) {
      counter--;
      console.log(counter);
      if (file.startsWith('medium')) continue;
      if (file.startsWith('thumb')) continue;
      const fileName = file;
      console.log({ fileName });
      if (fileName === '.DS_Store') continue;
      const isFileExist = await this.fileExists(path + fileName);
      if (!isFileExist) continue;

      const isDuplicated = await this.fileExists(
        __baseDir + '/storage/v1/ownerwebp/' + fileName.replace('.jpg', '.webp'),
      );
      console.log({ isDuplicated });

      if (isDuplicated) continue;

      const fileData = await fs.readFile(path + fileName);
      const thumbFileData = await fs.readFile(path + 'thumbnail-' + fileName);

      const args = {
        fileName,
        file: fileData,
        thumbFile: thumbFileData,
        folder: IMAGES_OWNER_PROPERTY_FOLDER,
        userId: null,
      };
      await this.attachmentService.createAttachmentInMigration(args);
    }
  }

  async uploadAttachments(): Promise<void> {
    const files = await fs.readdir(__baseDir + '/storage/v1/ownerwebp/');

    console.log({ l: files.length });
    let counter = files.length;
    for (const file of files) {
      counter--;
      console.log(counter);
      const fileName = file;
      console.log({ fileName });
      const path = __baseDir + '/storage/v1/ownerwebp/' + fileName;
      const fileData = await fs.readFile(path);

      this.s3Manager.uploadObject({
        // fullPath: `jayab/images/properties3/${fileName}`,
        fullPath: `${IMAGES_PROFILE_FOLDER}/${fileName}`,
        buffer: fileData,
      });
      // await fs.unlink(path);
    }
  }

  async fileExists(path: string): Promise<boolean> {
    try {
      await fs.stat(path);
      return true;
    } catch (error) {
      return false;
    }
  }
}
//https://kian-cdn1.s3.ir-thr-at1.arvanstorage.ir/jayab/images/properties/a4e9dcb59de9652095f9ab4e452f4a0e-1695593435444-750x1000.webp
