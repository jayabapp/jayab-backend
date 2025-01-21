import { Module } from '@nestjs/common';
import { PropertyCalendarOwnerController } from './owner.controller';
import { PropertyCalendarOwnerService } from './owner.service';
import { DayHelper } from 'src/common/helpers/day.helper';

@Module({
  controllers: [PropertyCalendarOwnerController],
  providers: [PropertyCalendarOwnerService, DayHelper],
})
export class PropertyCalendarOwnerModule {}
