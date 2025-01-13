import { Module } from '@nestjs/common';
import { FavoriteUserController } from './user.controller';
import { FavoriteUserService } from './user.service';

@Module({
  controllers: [FavoriteUserController],
  providers: [FavoriteUserService],
  exports: [FavoriteUserService],
})
export class FavoriteUserModule {}
