import { Module } from '@nestjs/common';
//@admin import { PropertyCalendarNoteAdminModule } from './roles/admin/admin.module';
//@user import { PropertyCalendarNoteUserModule } from './roles/user/user.module';
import { PropertyCalendarNoteOwnerModule } from './roles/owner/owner.module';

@Module({
  imports: [
    //@admin PropertyCalendarNoteAdminModule,
    //@user PropertyCalendarNoteUserModule
    PropertyCalendarNoteOwnerModule
  ],
})
export class PropertyCalendarNoteModule {}
