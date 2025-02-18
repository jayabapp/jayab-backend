import { Module } from '@nestjs/common';
import { PropertyAdminController } from './admin.controller';
import { PropertyAdminService } from './admin.service';
import { DayHelper } from 'src/common/helpers/day.helper';
import { PropertySerializer } from 'src/property/serializer/property.serializer';
import { PropertyAdminMigrationService } from './admin-migration.service';
import { AttachmentModule } from 'src/attachment/attachment.module';
import { S3ManagerModule } from 'src/s3-manager/s3-manager.module';

@Module({
  imports: [AttachmentModule, S3ManagerModule],
  controllers: [PropertyAdminController],
  providers: [PropertyAdminService, DayHelper, PropertySerializer, PropertyAdminMigrationService],
})
export class PropertyAdminModule {}
