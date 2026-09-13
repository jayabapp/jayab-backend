import { STORAGE_FONTS, STORAGE_PUBLIC, STORAGE_SEO } from './common/utils/constants/storage-folders';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { STORAGE, STORAGE_EXCEL, VIEWS_FONTS } from './common/utils/constants/storage-folders';
import { PropertyPhotoUpgradeRequestModule } from './property-photo-upgrade-request/property-photo-upgrade-request.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { cpSync, existsSync, mkdirSync } from 'fs';
import { CacheModule, type CacheStore } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IsCorrectPropertyOption } from './common/validators/is-correct-prop-opts.validator';
import { GeneratorCommandService } from './generator/command/generator-command.service';
import { MessengerChatroomModule } from './messenger-chatroom/messenger-chatroom.module';
import { MessengerMessagesModule } from './messenger-messages/messenger-messages.module';
import { PropertyAuthorizeModule } from './property-authorize/property-authorize.module';
import { PropertyCalendarModule } from './property-calendar/property-calendar.module';
import { SubscriptionPlanModule } from './subscription-plan/subscription-plan.module';
import { ContentCategoryModule } from './content-category/content-category.module';
import { ContentQuestionModule } from './content-question/content-question.module';
import { PropertyReserveModule } from './property-reserve/property-reserve.module';
import { PageSeoAnalyzeModule } from './page-seo-analyze/page-seo-analyze.module';
import { PaymentGatewayModule } from './payment-gateway/payment-gateway.module';
import { PropertyOptionModule } from './property-option/property-option.module';
import { PropertyReportModule } from './property-report/property-report.module';
import { SubmittedFormModule } from './submitted-form/submitted-form.module';
import { PropertyBadgeModule } from './property-badge/property-badge.module';
import { AccessControlModule } from './access-control/access-control.module';
import { NotificationModule } from './notification/notification.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppClusterService } from './app-cluster/app-cluster.service';
import { FormBuilderModule } from './form-builder/form-builder.module';
import { LandingPageModule } from './landing-page/landing-page.module';
import { RedirectUrlModule } from './redirect-url/redirect-url.module';
import { AdminPanelModule } from './admin-panel/admin-panel.module';
import { AttachmentModule } from './attachment/attachment.module';
import { GeneratorCommand } from './generator/command/generator.command';
import { GeneratorService } from './generator/generator.service';
import { IsParentCategory } from './common/validators/is-parent-category.validator';
import { TestAccessModule } from './test-access/test-access.module';
import { HealthController } from './health.controller';
import { GeneratorModule } from './generator/generator.module';
import { S3ManagerModule } from './s3-manager/s3-manager.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { FavoriteModule } from './favorite/favorite.module';
import { CategoryModule } from './category/category.module';
import { FirebaseModule } from './firebase/firebase.module';
import { PropertyModule } from './property/property.module';
import { AdvisorModule } from './advisor/advisor.module';
import { CommandModule } from 'nestjs-command';
import { CallLogModule } from './call-log/call-log.module';
import { IsSubCategory } from './common/validators/is-sub-category.validator';
import { ProfileModule } from './profile/profile.module';
import { PeakDayModule } from './peak-day/peak-day.module';
import { multerOptions } from './config/multer.config';
import { ContentModule } from './content/content.module';
import { SettingModule } from './setting/setting.module';
import { MulterModule } from '@nestjs/platform-express';
import { BannerModule } from './banner/banner.module';
import { TicketModule } from './ticket/ticket.module';
import { PrismaModule } from './prisma/prisma.module';
import { SocketModule } from './socket/socket.module';
import { ClientModule } from './client/client.module';
import { TasksModule } from './tasks/tasks.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { OwnerModule } from './owner/owner.module';
import { HttpModule } from '@nestjs/axios';
import { redisStore } from 'cache-manager-ioredis-yet';
import { BullModule } from '@nestjs/bull';
import { BaseModule } from './__base/base.module';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CityModule } from './city/city.module';
import { IsNotExist } from './common/validators/is-not-exists.validator';
import { APP_GUARD } from '@nestjs/core';
import { __baseDir } from './config/settings';
import { JwtModule } from '@nestjs/jwt';
import { IsPrice } from './common/validators/price-validator.decorator';
import { IsExist } from './common/validators/is-exists.validator';
import { Module } from '@nestjs/common';
import { join } from 'path';

import configValidations from './config/configuration-validation';
import configuration from './config/configuration';

import 'multer';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: configValidations, load: [configuration] }),
    PrismaModule,
    ServeStaticModule.forRoot({
      rootPath: join(__baseDir, 'storage/public'),
    }),
    MulterModule.register(multerOptions),
    FirebaseModule.forRoot({
      configPath:
        __baseDir + '/src/common/utils/constants/jayab-test-firebase-adminsdk-fbsvc-bcf224fe8e.json',
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: (await redisStore({
          host: config.get('redis.host'),
          port: config.get('redis.port'),
          password: config.get('redis.password'),
          keyPrefix: process.env.IS_SANDBOX == '1' ? 'sandbox:jayab:cache:' : 'jayab:cache:',
        })) as unknown as CacheStore,
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10000,
          limit: 50,
        },
      ],
      errorMessage: 'تعداد درخواست ها بیش از حد مجاز شده است',
    }),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        config: {
          host: config.get('redis.host'),
          port: config.get('redis.port'),
          password: config.get('redis.password'),
          keyPrefix: process.env.IS_SANDBOX == '1' ? 'sandbox:jayab:' : 'jayab:',
        },
      }),
    }),
    {
      ...BullModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          redis: {
            host: config.get('redis.host'),
            port: config.get('redis.port'),
            password: config.get('redis.password'),
          },
          prefix: process.env.IS_SANDBOX == '1' ? 'sandbox:jayab' : 'jayab',
          defaultJobOptions: { removeOnComplete: true, removeOnFail: true },
        }),
      }),
      global: true,
    },
    {
      ...HttpModule.register({}),
      global: true,
    },
    { ...JwtModule.register({}), global: true },
    NestScheduleModule.forRoot(),
    CommandModule,
    GeneratorModule,
    TasksModule,
    TestAccessModule,
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
    PropertyPhotoUpgradeRequestModule,
    SubscriptionPlanModule,
    ChatModule,
    PropertyAuthorizeModule,
    PropertyCalendarModule,
    PropertyBadgeModule,
    PaymentGatewayModule,
    PeakDayModule,
    LandingPageModule,
    FavoriteModule,
    BookmarkModule,
    SubscriptionModule,
    TicketModule,
    CallLogModule,
    PageSeoAnalyzeModule,
    RedirectUrlModule,
    MessengerMessagesModule,
    MessengerChatroomModule,
    PropertyReportModule,
    PropertyReserveModule,
    ClientModule,
    BaseModule,
  ],
  providers: [
    IsExist,
    IsPrice,
    IsNotExist,
    IsSubCategory,
    GeneratorService,
    IsParentCategory,
    GeneratorCommand,
    AppClusterService,
    GeneratorCommandService,
    IsCorrectPropertyOption,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [HealthController],
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
      cpSync(VIEWS_FONTS, STORAGE_FONTS, { recursive: true });
    } catch (error) {
      console.log('file create error', error);
    }
  }
}
