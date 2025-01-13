import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from './auth/auth.module';
import { AttachmentModule } from './attachment/attachment.module';
import configuration from './config/configuration';
import configValidations from './config/configuration-validation';
import { IsExist } from './common/validators/is-exists.validator';
import { PrismaModule } from './prisma/prisma.module';
import { multerOptions } from './config/multer.config';
import { __baseDir } from './config/settings';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
import { SettingModule } from './setting/setting.module';
import { CityModule } from './city/city.module';
import { AdminPanelModule } from './admin-panel/admin-panel.module';
import { AccessControlModule } from './access-control/access-control.module';
import { AppClusterService } from './app-cluster/app-cluster.service';
import { S3ManagerModule } from './s3-manager/s3-manager.module';
import { IsNotExist } from './common/validators/is-not-exists.validator';
import { GeneratorModule } from './generator/generator.module';
import { CommandModule } from 'nestjs-command';
import { IsSubCategory } from './common/validators/is-sub-category.validator';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { CategoryModule } from './category/category.module';
import { IsParentCategory } from './common/validators/is-parent-category.validator';
import { FirebaseModule } from './firebase/firebase.module';
import { GeneratorCommand } from './generator/command/generator.command';
import { GeneratorCommandService } from './generator/command/generator-command.service';
import { GeneratorService } from './generator/generator.service';
import { ContentCategoryModule } from './content-category/content-category.module';
import { ContentModule } from './content/content.module';
import { BannerModule } from './banner/banner.module';
import { APP_GUARD } from '@nestjs/core';
import { SubmittedFormModule } from './submitted-form/submitted-form.module';
import { cpSync, existsSync, mkdirSync } from 'fs';
import {
  STORAGE,
  STORAGE_EXCEL,
  STORAGE_FONTS,
  STORAGE_PUBLIC,
  STORAGE_SEO,
  VIEWS_FONTS,
} from './common/utils/constants/storage-folders';
import { SocketModule } from './socket/socket.module';
import { FormBuilderModule } from './form-builder/form-builder.module';
import { ContentQuestionModule } from './content-question/content-question.module';
import { TasksModule } from './tasks/tasks.module';
import { ProfileModule } from './profile/profile.module';
import { OwnerModule } from './owner/owner.module';
import { AdvisorModule } from './advisor/advisor.module';
import { NotificationModule } from './notification/notification.module';
import { UserModule } from './user/user.module';
import { PropertyOptionModule } from './property-option/property-option.module';
import { PropertyModule } from './property/property.module';
import { SubscriptionPlanModule } from './subscription-plan/subscription-plan.module';
import { PropertyAuthorizeModule } from './property-authorize/property-authorize.module';
import { IsCorrectPropertyOption } from './common/validators/is-correct-prop-opts.validator';
import { IsPrice } from './common/validators/price-validator.decorator';
import { ChatModule } from './chat/chat.module';
import { PropertyCalendarModule } from './property-calendar/property-calendar.module';
import { PropertyBadgeModule } from './property-badge/property-badge.module';
import { PaymentGatewayModule } from './payment-gateway/payment-gateway.module';
import { PeakDayModule } from './peak-day/peak-day.module';
import { FavoriteModule } from './favorite/favorite.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { BaseModule as BaseModule } from './__base/base.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: configValidations, load: [configuration] }),
    PrismaModule,
    ServeStaticModule.forRoot({
      rootPath: join(__baseDir, 'storage/public'),
    }),
    MulterModule.register(multerOptions),
    FirebaseModule.forRoot({
      configPath: __baseDir + '/src/common/utils/constants/modmall-firebase-adminsdk-ynl0k-479f63222c.json',
    }),
    CacheModule.register({
      // ttl: 60 * 1000,
      max: 1000, // maximum number of items in cache
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 50,
      },
    ]),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        config: {
          host: config.get('redis.host'),
          port: config.get('redis.port'),
          password: config.get('redis.password'),
          keyPrefix: 'jayab',
        },
      }),
    }),
    {
      ...HttpModule.register({}),
      global: true,
    },
    { ...JwtModule.register({}), global: true },
    NestScheduleModule.forRoot(),
    // ...(process.env.NODE_ENV == 'productionn' ? [TasksModule] : []) ,
    CommandModule,
    GeneratorModule,
    TasksModule,
    AuthModule,
    AccessControlModule,
    AdminPanelModule,
    AttachmentModule,
    CityModule,
    S3ManagerModule,
    SettingModule,
    CategoryModule,
    ContentCategoryModule,
    ContentModule,
    ContentQuestionModule,
    BannerModule,
    SocketModule,
    FormBuilderModule,
    SubmittedFormModule,
    ProfileModule,
    OwnerModule,
    AdvisorModule,
    NotificationModule,
    UserModule,
    OwnerModule,
    PropertyOptionModule,
    PropertyModule,
    SubscriptionPlanModule,
    ChatModule,
    PropertyAuthorizeModule,
    PropertyCalendarModule,
    PropertyBadgeModule,
    PaymentGatewayModule,
    PeakDayModule,
    FavoriteModule,
    BookmarkModule,
    BaseModule,
  ],
  providers: [
    GeneratorCommand,
    GeneratorCommandService,
    GeneratorService,
    IsNotExist,
    IsExist,
    IsPrice,
    IsParentCategory,
    IsSubCategory,
    AppClusterService,
    IsCorrectPropertyOption,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  constructor() {
    this.createStorageFolder();
  }

  async createStorageFolder() {
    try {
      const folders = [STORAGE, STORAGE_PUBLIC, STORAGE_FONTS, STORAGE_SEO, STORAGE_EXCEL];

      console.log(folders);
      for (const folder of folders) {
        if (!existsSync(folder)) {
          mkdirSync(folder);
        }
      }
      cpSync(VIEWS_FONTS, __baseDir + STORAGE_FONTS, { recursive: true });
    } catch (error) {
      console.log('file create error', error);
    }
  }
}
