import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { ApiClientService } from './service/api-client.service';
import { LoadTesterService } from './service/load-tester.service';
import { RandomService } from './service/random.service';
import { StatisticsService } from './service/statistics.service';
import { config, mainConfigValidationSchema } from './config';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule,
    ConfigModule.forRoot({
      envFilePath: ['.env.production', '.env.local', '.env'],
      validationSchema: mainConfigValidationSchema(),
      load: [config],
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [ApiClientService, LoadTesterService, RandomService, StatisticsService],
})
export class AppModule {}
