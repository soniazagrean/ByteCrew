import { ServiceUnavailableException } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from './database/prisma.service';

describe('AppController health', () => {
  it('returns ok when the database responds', async () => {
    const c = new AppController({ $queryRaw: jest.fn().mockResolvedValue([1]) } as unknown as PrismaService);
    await expect(c.healthCheck()).resolves.toMatchObject({ status: 'ok', database: 'up' });
  });

  it('throws 503 when the database is down', async () => {
    const c = new AppController({ $queryRaw: jest.fn().mockRejectedValue(new Error('x')) } as unknown as PrismaService);
    await expect(c.healthCheck()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
