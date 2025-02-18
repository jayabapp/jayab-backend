import { Module } from '@nestjs/common';
import { PropertyAdminController } from './admin.controller';
import { PropertyAdminService } from './admin.service';
import { DayHelper } from 'src/common/helpers/day.helper';
import { PropertySerializer } from 'src/property/serializer/property.serializer';
import { PropertyAdminMigrationService } from './admin-migration.service';
import { AttachmentModule } from 'src/attachment/attachment.module';

@Module({
  imports: [AttachmentModule],
  controllers: [PropertyAdminController],
  providers: [PropertyAdminService, DayHelper, PropertySerializer, PropertyAdminMigrationService],
})
export class PropertyAdminModule {}
