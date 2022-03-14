import { Controller, Get } from '@nestjs/common';
import { AppService } from './service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  async index() {
    return this.appService.getStatus();
  }
}
