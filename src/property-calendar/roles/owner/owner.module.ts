import { Module } from '@nestjs/common';
import { PropertyCalendarOwnerController } from './owner.controller';
import { PropertyCalendarOwnerService } from './owner.service';

@Module({
  controllers: [PropertyCalendarOwnerController],
  providers: [PropertyCalendarOwnerService],
})
export class PropertyCalendarOwnerModule {}
