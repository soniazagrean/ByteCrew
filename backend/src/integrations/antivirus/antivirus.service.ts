import { Injectable, Logger, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { Readable } from 'stream';
import NodeClam = require('clamscan');

export type ScanResult = { clean: true } | { clean: false; signature: string };

export type AntivirusMode = 'clamav' | 'disabled';

const ANTIVIRUS_MODES: readonly AntivirusMode[] = ['clamav', 'disabled'];

@Injectable()
export class AntivirusService implements OnModuleInit {
  private readonly logger = new Logger(AntivirusService.name);
  private readonly mode: AntivirusMode = resolveMode(process.env.ANTIVIRUS_MODE);
  private scanner?: Promise<NodeClam>;

  onModuleInit(): void {
    if (this.mode !== 'disabled') return;
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ANTIVIRUS_MODE=disabled is not allowed when NODE_ENV=production');
    }
    this.logger.warn('Antivirus scanning is DISABLED (ANTIVIRUS_MODE=disabled). Use this for local development only.');
  }

  async scan(buffer: Buffer): Promise<ScanResult> {
    if (this.mode === 'disabled') return { clean: true };

    let result: { isInfected: boolean | null; viruses: string[] };
    try {
      const clam = await this.getScanner();
      result = await clam.scanStream(Readable.from([buffer]));
    } catch (error) {
      this.scanner = undefined;
      this.logger.error(`Antivirus scan failed: ${error instanceof Error ? error.message : String(error)}`);
      throw scannerUnavailable();
    }

    if (result.isInfected === true) {
      return { clean: false, signature: result.viruses[0] ?? 'unknown' };
    }
    if (result.isInfected === false) {
      return { clean: true };
    }
    this.logger.error('Antivirus scan returned no verdict (clamd timeout)');
    throw scannerUnavailable();
  }

  private getScanner(): Promise<NodeClam> {
    if (!this.scanner) {
      this.scanner = new NodeClam().init({
        removeInfected: false,
        quarantineInfected: false,
        debugMode: false,
        clamscan: { active: false },
        clamdscan: {
          host: process.env.CLAMAV_HOST || '127.0.0.1',
          port: toPositiveInt(process.env.CLAMAV_PORT, 3310),
          timeout: toPositiveInt(process.env.CLAMAV_TIMEOUT_MS, 60_000),
          localFallback: false,
          bypassTest: false,
          active: true,
        },
        preference: 'clamdscan',
      });
    }
    return this.scanner;
  }
}

function resolveMode(raw: string | undefined): AntivirusMode {
  const mode = (raw || 'clamav').trim().toLowerCase();
  if (!ANTIVIRUS_MODES.includes(mode as AntivirusMode)) {
    throw new Error(`ANTIVIRUS_MODE must be one of ${ANTIVIRUS_MODES.join(', ')}, got "${raw}"`);
  }
  return mode as AntivirusMode;
}

function toPositiveInt(raw: string | undefined, fallback: number): number {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function scannerUnavailable(): ServiceUnavailableException {
  return new ServiceUnavailableException('File scanning is temporarily unavailable. Please try again later.');
}
