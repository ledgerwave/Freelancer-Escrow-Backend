import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getTest(): object {
    return {
      message: 'Test endpoint is working!',
      timestamp: new Date().toISOString(),
      status: 'success',
      environment: process.env.NODE_ENV || 'development'
    };
  }
}
