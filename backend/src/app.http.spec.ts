import { BadRequestException, Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppController } from './app.controller';
import { PrismaService } from './database/prisma.service';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Controller('t')
class TestController {
  @Get('boom') boom() { throw new Error('secret internal detail'); }
  @Get('bad') bad() { throw new BadRequestException('nope'); }
  @Get('ok') ok() { return { a: 1 }; }
}

describe('HTTP stack (health + filter + interceptor)', () => {
  let app: INestApplication;
  const prisma = { $queryRaw: jest.fn() };

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      controllers: [AppController, TestController],
      providers: [{ provide: PrismaService, useValue: prisma }],
    }).compile();
    app = mod.createNestApplication();
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new LoggingInterceptor());
    await app.init();
  });
  afterAll(() => app.close());

  it('GET /health 200 when DB up', async () => {
    prisma.$queryRaw.mockResolvedValue([1]);
    const r = await request(app.getHttpServer()).get('/health').expect(200);
    expect(r.body).toMatchObject({ status: 'ok', database: 'up' });
  });
  it('GET /health 503 when DB down', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('conn'));
    const r = await request(app.getHttpServer()).get('/health').expect(503);
    expect(r.body).toMatchObject({ statusCode: 503, message: 'Database unavailable', status: 'error', database: 'down' });
  });
  it('unknown error -> 500 without leaking internals', async () => {
    const r = await request(app.getHttpServer()).get('/t/boom').expect(500);
    expect(JSON.stringify(r.body)).not.toContain('secret');
    expect(r.body.message).toBe('Internal server error');
  });
  it('HttpException keeps status and message', async () => {
    const r = await request(app.getHttpServer()).get('/t/bad').expect(400);
    expect(r.body.message).toBe('nope');
  });
  it('normal response untouched', async () => {
    const r = await request(app.getHttpServer()).get('/t/ok').expect(200);
    expect(r.body).toEqual({ a: 1 });
  });
});
