import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validateEnv } from './env.validation';

@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: true,
            // Environment-specific file wins, then the shared .env.
            // Real environment variables (CI / hosting provider) always take priority.
            envFilePath: [`.env.${process.env.NODE_ENV ?? 'development'}`, '.env'],
            validate: validateEnv,
        }),
    ],
})
export class ConfigModule {}
