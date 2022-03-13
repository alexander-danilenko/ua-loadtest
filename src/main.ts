import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiClientService } from './service/api-client.service';
import { LoadTesterService } from './service/load-tester.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Keep at the very bottom of the bootstrap callback.
  const configService = app.get(ConfigService);
  await app.listen(configService.get<number>('app.port'));

  // Fetch data for the API client.
  const apiClient = app.get(ApiClientService);
  await apiClient.fetchAll();

  // Run infinite loop here.
  const loadTesterService = app.get(LoadTesterService);
  loadTesterService.infiniteLoop();
}
bootstrap();
