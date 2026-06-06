import { RedisModule } from '@liaoliaots/nestjs-redis';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { cpSync, existsSync, mkdirSync } from 'fs';
import { CommandModule } from 'nestjs-command';
import { join } from 'path';
import { BaseModule } from './__base/base.module';
import { AccessControlModule } from './access-control/access-control.module';
import { AdminPanelModule } from './admin-panel/admin-panel.module';
import { AdvisorModule } from './advisor/advisor.module';
import { AppClusterService } from './app-cluster/app-cluster.service';
import { AttachmentModule } from './attachment/attachment.module';
import { AuthModule } from './auth/auth.module';
import { BannerModule } from './banner/banner.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { CallLogModule } from './call-log/call-log.module';
import { CategoryModule } from './category/category.module';
import { ChatModule } from './chat/chat.module';
import { CityModule } from './city/city.module';
import {
  STORAGE,
  STORAGE_EXCEL,
  STORAGE_FONTS,
  STORAGE_PUBLIC,
  STORAGE_SEO,
  VIEWS_FONTS,
} from './common/utils/constants/storage-folders';
import { IsCorrectPropertyOption } from './common/validators/is-correct-prop-opts.validator';
import { IsExist } from './common/validators/is-exists.validator';
import { IsNotExist } from './common/validators/is-not-exists.validator';
import { IsParentCategory } from './common/validators/is-parent-category.validator';
import { IsSubCategory } from './common/validators/is-sub-category.validator';
import { IsPrice } from './common/validators/price-validator.decorator';
import configuration from './config/configuration';
import configValidations from './config/configuration-validation';
import { multerOptions } from './config/multer.config';
import { __baseDir } from './config/settings';
import { ContentCategoryModule } from './content-category/content-category.module';
import { ContentQuestionModule } from './content-question/content-question.module';
import { ContentModule } from './content/content.module';
import { FavoriteModule } from './favorite/favorite.module';
import { FirebaseModule } from './firebase/firebase.module';
import { FormBuilderModule } from './form-builder/form-builder.module';
import { GeneratorCommandService } from './generator/command/generator-command.service';
import { GeneratorCommand } from './generator/command/generator.command';
import { GeneratorModule } from './generator/generator.module';
import { GeneratorService } from './generator/generator.service';
import { LandingPageModule } from './landing-page/landing-page.module';
import { MessengerChatroomModule } from './messenger-chatroom/messenger-chatroom.module';
import { MessengerMessagesModule } from './messenger-messages/messenger-messages.module';
import { NotificationModule } from './notification/notification.module';
import { OwnerModule } from './owner/owner.module';
import { PageSeoAnalyzeModule } from './page-seo-analyze/page-seo-analyze.module';
import { PaymentGatewayModule } from './payment-gateway/payment-gateway.module';
import { PeakDayModule } from './peak-day/peak-day.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
import { PropertyAuthorizeModule } from './property-authorize/property-authorize.module';
import { PropertyBadgeModule } from './property-badge/property-badge.module';
import { PropertyCalendarModule } from './property-calendar/property-calendar.module';
import { PropertyOptionModule } from './property-option/property-option.module';
import { PropertyReportModule } from './property-report/property-report.module';
import { PropertyReserveModule } from './property-reserve/property-reserve.module';
import { PropertyModule } from './property/property.module';
import { RedirectUrlModule } from './redirect-url/redirect-url.module';
import { S3ManagerModule } from './s3-manager/s3-manager.module';
import { SettingModule } from './setting/setting.module';
import { SocketModule } from './socket/socket.module';
import { SubmittedFormModule } from './submitted-form/submitted-form.module';
import { SubscriptionPlanModule } from './subscription-plan/subscription-plan.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { TasksModule } from './tasks/tasks.module';
import { TicketModule } from './ticket/ticket.module';
import { UserModule } from './user/user.module';
import { ClientModule } from './client/client.module';

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
    CacheModule.register({
      // ttl: 60 * 1000,
      max: 1000, // maximum number of items in cache
      isGlobal: true,
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
