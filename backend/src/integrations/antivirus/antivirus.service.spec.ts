import { ServiceUnavailableException } from '@nestjs/common';
import { AntivirusService } from './antivirus.service';

const mockScanStream = jest.fn();
const mockInit = jest.fn();

jest.mock('clamscan', () => jest.fn().mockImplementation(() => ({ init: mockInit })));

const ENV_KEYS = ['ANTIVIRUS_MODE', 'NODE_ENV', 'CLAMAV_HOST', 'CLAMAV_PORT', 'CLAMAV_TIMEOUT_MS'] as const;

describe('AntivirusService', () => {
  const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
  const file = Buffer.from('%PDF-1.4 harmless content');

  beforeEach(() => {
    jest.clearAllMocks();
    for (const key of ENV_KEYS) delete process.env[key];
    mockInit.mockResolvedValue({ scanStream: mockScanStream });
  });

  afterAll(() => {
    for (const key of ENV_KEYS) {
      if (originalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnv[key];
    }
  });

  describe('clamav mode (default)', () => {
    it('reports a clean file', async () => {
      mockScanStream.mockResolvedValue({ isInfected: false, viruses: [] });

      await expect(new AntivirusService().scan(file)).resolves.toEqual({ clean: true });
    });

    it('reports an infected file with its signature', async () => {
      mockScanStream.mockResolvedValue({ isInfected: true, viruses: ['Eicar-Signature'] });

      await expect(new AntivirusService().scan(file)).resolves.toEqual({ clean: false, signature: 'Eicar-Signature' });
    });

    it('connects to clamd using the CLAMAV_* settings and never falls back to a local binary', async () => {
      process.env.CLAMAV_HOST = 'clamav';
      process.env.CLAMAV_PORT = '3311';
      process.env.CLAMAV_TIMEOUT_MS = '5000';
      mockScanStream.mockResolvedValue({ isInfected: false, viruses: [] });

      await new AntivirusService().scan(file);

      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          clamdscan: expect.objectContaining({ host: 'clamav', port: 3311, timeout: 5000, localFallback: false }),
          preference: 'clamdscan',
        }),
      );
    });

    it('reuses one clamd client across scans', async () => {
      mockScanStream.mockResolvedValue({ isInfected: false, viruses: [] });
      const service = new AntivirusService();

      await service.scan(file);
      await service.scan(file);

      expect(mockInit).toHaveBeenCalledTimes(1);
    });

    it('fails closed with 503 when clamd is unreachable, and retries on the next scan', async () => {
      mockInit.mockRejectedValueOnce(new Error('connect ECONNREFUSED 127.0.0.1:3310'));
      const service = new AntivirusService();

      await expect(service.scan(file)).rejects.toBeInstanceOf(ServiceUnavailableException);

      mockScanStream.mockResolvedValue({ isInfected: false, viruses: [] });
      await expect(service.scan(file)).resolves.toEqual({ clean: true });
      expect(mockInit).toHaveBeenCalledTimes(2);
    });

    it('fails closed with 503 when the scan itself errors', async () => {
      mockScanStream.mockRejectedValue(new Error('INSTREAM size limit exceeded. ERROR'));

      await expect(new AntivirusService().scan(file)).rejects.toBeInstanceOf(ServiceUnavailableException);
    });

    it('fails closed with 503 when clamd returns no verdict', async () => {
      mockScanStream.mockResolvedValue({ isInfected: null, viruses: [] });

      await expect(new AntivirusService().scan(file)).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
  });

  describe('disabled mode', () => {
    it('skips scanning without contacting clamd', async () => {
      process.env.ANTIVIRUS_MODE = 'disabled';
      const service = new AntivirusService();
      service.onModuleInit();

      await expect(service.scan(file)).resolves.toEqual({ clean: true });
      expect(mockInit).not.toHaveBeenCalled();
    });

    it('refuses to start in production', () => {
      process.env.ANTIVIRUS_MODE = 'disabled';
      process.env.NODE_ENV = 'production';

      expect(() => new AntivirusService().onModuleInit()).toThrow(/not allowed/);
    });
  });

  it('rejects an unknown ANTIVIRUS_MODE at startup', () => {
    process.env.ANTIVIRUS_MODE = 'off';

    expect(() => new AntivirusService()).toThrow(/ANTIVIRUS_MODE/);
  });
});

const describeLive = process.env.CLAMAV_LIVE_TEST === '1' ? describe : describe.skip;

describeLive('AntivirusService against a real clamd', () => {
  const eicar = Buffer.from(['X5O!P%@AP[4\\PZX54(P^)7CC)7}$', 'EICAR-STANDARD-', 'ANTIVIRUS-TEST-FILE!$H+H*'].join(''));

  function loadRealService(): AntivirusService {
    let RealService!: typeof AntivirusService;
    jest.isolateModules(() => {
      jest.doMock('clamscan', () => jest.requireActual('clamscan'));
      RealService = require('./antivirus.service').AntivirusService;
    });
    return new RealService();
  }

  it('flags the EICAR test file', async () => {
    const result = await loadRealService().scan(eicar);

    expect(result.clean).toBe(false);
  }, 30_000);

  it('passes a harmless file', async () => {
    await expect(loadRealService().scan(Buffer.from('%PDF-1.4 hello'))).resolves.toEqual({ clean: true });
  }, 30_000);
});
