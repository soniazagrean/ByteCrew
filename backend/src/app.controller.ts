import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  healthCheck() {
    // TODO: return service status for the deployment health-check (Epic 8)
  }
}
