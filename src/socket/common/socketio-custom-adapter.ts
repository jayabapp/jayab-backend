// src/socket-io-custom.adapter.ts
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

export class SocketIoCustomAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const allowed = [...new Set((process.env.ALLOWED_CORS_IP || '').split(',').concat('127.0.0.1'))];
    const domainBypass = [...new Set((process.env.ALLOWED_CORS_DOMAIN || '').split(','))];
    const allowedOrigins = [...allowed, ...domainBypass];

    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: (origin: string, callback: any) => {
          if (allowedOrigins.some((domain) => origin?.includes(domain))) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        methods: ['GET', 'POST'],
        credentials: true,
      },
      allowRequest: (req, callback) => {
        const origin = req.headers.origin;
        if (!origin || allowedOrigins.some((domain) => origin?.includes(domain))) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed'), false);
        }
      },
    });

    return server;
  }
}
