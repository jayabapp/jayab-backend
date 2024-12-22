import { Module } from '@nestjs/common';
import { CategoryUserController } from './category-user.controller';
import { CategoryUserService } from './category-user.service';

@Module({
  controllers: [CategoryUserController],
  providers: [CategoryUserService],
  exports: [CategoryUserService],
})
export class CategoryUserModule {}
