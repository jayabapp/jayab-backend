import { Module } from '@nestjs/common';
import { PropertyUserService } from './user.service';
import { PropertyUserController } from './user.controller';
import { PropertySerializer } from 'src/property/serializer/property.serializer';
import { DayHelper } from 'src/common/helpers/day.helper';

@Module({
  controllers: [PropertyUserController],
  providers: [PropertyUserService, PropertySerializer, DayHelper],
})
export class PropertyUserModule {}
