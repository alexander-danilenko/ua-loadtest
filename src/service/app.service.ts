import { AxiosResponse } from 'axios';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { StatisticsService } from './statistics.service';
import { UashieldService } from './uashield.service';

/**
 * Main application service. All the magic happens here.
 */
@Injectable()
export class AppService {
  /**
   * The service logger.
   */
  logger = new ConsoleLogger(this.constructor.name);

  /**
   * Defines how many requests may run in parallel.
   */
  concurrency: number;

  constructor(
    protected readonly statistics: StatisticsService,
    protected readonly configService: ConfigService,
    protected readonly apiClient: UashieldService,
  ) {
    this.concurrency = this.configService.get('app.concurrency', 500);
  }

  /**
   * Makes requests to target URLs by cron.
   *
   * Max possible promises stored in memory could be calculated by:
   *   concurrency * timeout (in seconds)
   * So for 500 concurrent requests and 10s timeout max possible values in memory is:
   *   500 * 10 = 5000
   */
  @Cron('* * * * * *') // Each second.
  async infiniteLoop() {
    // If no URLs was fetched then nothing to do.
    if (!this.apiClient.urls.size) {
      return;
    }

    // Collect requests into array.
    const concurrentRequests = [...Array(this.concurrency).keys()].map(() => this.apiClient.requestRandom());

    // Run promises and handle promise results.
    (await Promise.allSettled(concurrentRequests)).forEach((promiseResult) =>
      this.handleAxiosPromiseResults(promiseResult),
    );
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
        if (['ECONNREFUSED', 'ECONNABORTED'].includes(reason.code)) {
          this.statistics.trackTimeout(url, reason.code, reason.message);
        } else {
          this.statistics.trackError(url, reason.code, reason.message);
        }
        break;
    }
  }

  /**
   * Prints statistics to the console on a ragular basis.
   */
  @Cron('*/30 * * * * *') // Each 30 seconds.
  async logGlobalStatistics() {
    const { logClear, logSummaryTable } = this.configService.get('app.logging');
    const [global, perSite] = await Promise.all([this.statistics.getStatsGlobal(), this.statistics.getStatsPerSite()]);

    // No statistic collected - means no requests finished yet.
    if (!Object.keys(perSite).length) {
      this.logger.log('Load testing is in progress...');
      return;
    }

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
    console.log(JSON.stringify(status));
  }

  /**
   * Returns load testing status. Used in controller.
   */
  async getStatus() {
    return {
      concurrency: this.concurrency,
      ...(await this.statistics.getHardwareStatus()),
      stats: await this.statistics.getStatsGlobal(),
      proxies: this.apiClient.axiosProxies.length,
      currentTargets: Array.from(this.apiClient.urls),
    };
  }
}
