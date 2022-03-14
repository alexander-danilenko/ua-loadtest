import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService, RandomService, StatisticsService, UashieldService } from './service';
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
  providers: [UashieldService, RandomService, StatisticsService, AppService],
})
export class AppModule {}
