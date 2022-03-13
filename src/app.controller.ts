import { Controller, Get } from '@nestjs/common';
import { LoadTesterService } from './service/load-tester.service';

@Controller()
export class AppController {
  constructor(private readonly appService: LoadTesterService) {}

  @Get('/')
  async index() {
    return this.appService.getStatus();
  }
}
