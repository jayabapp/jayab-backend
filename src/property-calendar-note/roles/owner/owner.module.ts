import { Module } from '@nestjs/common';
import { PropertyCalendarNoteOwnerController } from './owner.controller';
import { PropertyCalendarNoteOwnerService } from './owner.service';

@Module({
  controllers: [PropertyCalendarNoteOwnerController],
  providers: [PropertyCalendarNoteOwnerService],
})
export class PropertyCalendarNoteOwnerModule {}
