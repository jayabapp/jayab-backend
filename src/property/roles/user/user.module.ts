import { Module } from '@nestjs/common';
import { PropertyUserService } from './user.service';
import { PropertyUserController } from './user.controller';

@Module({
  controllers: [PropertyUserController],
  providers: [PropertyUserService],
})
export class PropertyUserModule {}
