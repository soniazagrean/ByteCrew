import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  async healthCheck() {
    const base = {
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
    };
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'up', ...base };
    } catch {
      throw new ServiceUnavailableException({ message: 'Database unavailable', status: 'error', database: 'down', ...base });
    }
  }
}
