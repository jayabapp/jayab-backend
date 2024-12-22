import { Controller, Post, UseGuards } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';

@UseGuards(AdminJwtGuard)
@Controller('admin/fcm')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post()
  async test(): Promise<any> {
    // await this.firebaseService.sendNotification()
    return '';
  }
}
