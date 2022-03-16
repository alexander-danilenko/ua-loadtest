import { cpu, mem } from 'node-os-utils';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingConfigInterface, UashieldConfigInterface } from '../config';

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
  loggingConfig: LoggingConfigInterface;

  /**
   * UAShield config.
   */
  shieldConfig: UashieldConfigInterface;

  constructor(private readonly configService: ConfigService) {
    this.loggingConfig = this.configService.get<LoggingConfigInterface>('app.logging');
    this.shieldConfig = this.configService.get<UashieldConfigInterface>('apis.uashield');
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
    if (this.loggingConfig.logSuccess) {
      const proxy = this.shieldConfig.useProxy ? 'PROXY' : null;
      this.logger.log(['OK', site, proxy, statusCode, message].filter((v) => !!v).join(' | '));
    }
  }

  trackTimeout(site: string, code?: number, message = '') {
    this.track(StatisticsType.Timeout, site);
    if (this.loggingConfig.logTimeouts) {
      const proxy = this.shieldConfig.useProxy ? 'PROXY' : null;
      this.logger.log(['OK', site, proxy, message].filter((v) => !!v).join(' | '));
    }
  }

  trackError(site: string, statusCode?: number, message = '') {
    this.track(StatisticsType.Error, site);
    if (this.loggingConfig.logErrors) {
      const proxy = this.shieldConfig.useProxy ? 'PROXY' : null;
      this.logger.error([site, proxy, statusCode, message].filter((v) => !!v).join(' | '));
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
