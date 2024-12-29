import { Module } from '@nestjs/common';
import { PropertyUserController } from './user.controller';
import { PropertyUserService } from './user.service';

@Module({
  controllers: [PropertyUserController],
  providers: [PropertyUserService],
})
export class PropertyUserModule {}
