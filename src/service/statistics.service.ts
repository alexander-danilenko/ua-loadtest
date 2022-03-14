import { cpu, mem } from 'node-os-utils';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingConfigInterface } from '../config';

enum StatisticsType {
  'Success' = 'success',
  'Timeout' = 'timeout',
  'Error' = 'error',
}

/**
 * Service that stores statistics in memory.
 * Note: web-server restart will lead to statistic reset.
 */
@Injectable()
export class StatisticsService {
  /**
   * Logger service.
   */
  logger = new ConsoleLogger(this.constructor.name);

  /**
   * Logging settings defined in config.
   */
  loggingSettings: LoggingConfigInterface;

  constructor(private readonly configService: ConfigService) {
    this.loggingSettings = this.configService.get<LoggingConfigInterface>('app.logging');
  }

  /**
   * Stores statistic for all possible events keyed by site.
   * @TODO: Cache in file system for being able to resume.
   */
  protected statsPerSite: {
    [key: string]: {
      [key in StatisticsType]: number;
    };
  } = {};

  /**
   * Increments statistics of certain event for site.
   */
  protected track(type: StatisticsType, site: string) {
    if (!Object.keys(this.statsPerSite).includes(site)) {
      this.statsPerSite[site] = {
        [StatisticsType.Success]: 0,
        [StatisticsType.Timeout]: 0,
        [StatisticsType.Error]: 0,
      };
    }
    this.statsPerSite[site][type]++;
  }

  trackSuccess(site: string, statusCode?: number, message = '') {
    this.track(StatisticsType.Success, site);
    if (this.loggingSettings.logSuccess) {
      this.logger.debug(`[SUCCESS:${statusCode}] Attacked: ${site} ${message}`);
    }
  }

  trackTimeout(site: string, message = '') {
    this.track(StatisticsType.Timeout, site);
    if (this.loggingSettings.logTimeouts) {
      this.logger.debug(`[TIMEOUT] Attacked: ${site} ${message}`);
    }
  }

  trackError(site: string, statusCode?: number, message = '') {
    this.track(StatisticsType.Error, site);
    if (this.loggingSettings.logErrors) {
      this.logger.error(`[ERROR] ${site} ${message}`);
    }
  }

  /**
   * Returns all statistics for sites.
   */
  async getStatsPerSite() {
    return this.statsPerSite;
  }

  /**
   * Returns all statistics for sites.
   */
  async getStatsGlobal() {
    return {
      [StatisticsType.Success]: Object.keys(this.statsPerSite || {}).reduce((accumulator, stat) => {
        accumulator += this.statsPerSite[stat].success;
        return accumulator;
      }, 0),
      [StatisticsType.Timeout]: Object.keys(this.statsPerSite || {}).reduce((accumulator, stat) => {
        accumulator += this.statsPerSite[stat].timeout;
        return accumulator;
      }, 0),
      [StatisticsType.Error]: Object.keys(this.statsPerSite || {}).reduce((accumulator, stat) => {
        accumulator += this.statsPerSite[stat].error;
        return accumulator;
      }, 0),
    };
  }

  /**
   * Returns hardware status.
   */
  async getHardwareStatus() {
    const { usedMemMb, totalMemMb } = await mem.used();
    return {
      cpu: (await cpu.usage(100)).toFixed(2) + '%',
      mem: ((usedMemMb * 100) / totalMemMb).toFixed(2) + '%',
      memUsed: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + 'Mb',
    };
  }
}
