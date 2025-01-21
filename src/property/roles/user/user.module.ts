import { Module } from '@nestjs/common';
import { PropertyUserService } from './user.service';
import { PropertyUserController } from './user.controller';
import { PropertySerializer } from 'src/property/serializer/property.serializer';
import { DayHelper } from 'src/common/helpers/day.helper';
import { ProfileUserModule } from 'src/profile/roles/user/profile-user.module';

@Module({
  imports: [ProfileUserModule],
  controllers: [PropertyUserController],
  providers: [PropertyUserService, PropertySerializer, DayHelper],
  exports: [PropertyUserService],
})
export class PropertyUserModule {}
