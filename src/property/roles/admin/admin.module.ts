import { Module } from '@nestjs/common';
import { PropertyAdminController } from './admin.controller';
import { PropertyAdminService } from './admin.service';
import { DayHelper } from 'src/common/helpers/day.helper';
import { PropertySerializer } from 'src/property/serializer/property.serializer';

@Module({
  controllers: [PropertyAdminController],
  providers: [PropertyAdminService, DayHelper, PropertySerializer],
})
export class PropertyAdminModule {}
