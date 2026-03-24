import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AvanakService {
  private readonly logger = new Logger(AvanakService.name);
  private readonly isProduction: boolean;

  constructor(private configService: ConfigService) {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  async quickCall(mobile: string): Promise<void> {
    const token = this.configService.get('avanak.token');
    const url = 'https://portal.avanak.ir/Rest/QuickSend';
    try {
      const res = await axios({
        method: 'GET',
        url,
        headers: { Authorization: token },
        data: {
          MessageID: '44774433',
          Number: '09126814598',
        },
      });
      console.log(res.data);
    } catch (error) {
      console.log('Avanak Error');
      console.log(error);
    }
  }
}
