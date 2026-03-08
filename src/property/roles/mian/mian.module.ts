import { Module } from '@nestjs/common';
import { PropertyMianController } from './mian.controller';
import { PropertyMianService } from './mian.service';

@Module({
  controllers: [PropertyMianController],
  providers: [PropertyMianService],
})
export class PropertyMianModule {}
