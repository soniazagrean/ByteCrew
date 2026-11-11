import { Injectable, ServiceUnavailableException } from '@nestjs/common';

export interface PutObjectInput {
  key: string;
  body: Buffer;
  contentType: string;
}

@Injectable()
export class StorageService {
  async putObject(input: PutObjectInput): Promise<{ key: string }> {
    throw new ServiceUnavailableException(`File storage is not configured yet (BYT-85); "${input.key}" was not stored.`);
  }
}
