import { AxiosProxyConfig, AxiosRequestConfig } from 'axios';
import * as https from 'https';
import { sample as _sample } from 'lodash';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { RandomService } from './random.service';
import { HostResponseInterface, ProxyInterface } from '../interface';

@Injectable()
export class ApiClientService {
  /**
   * Axios config used for iteracting with an API service.
   *
   * Note: Config for sites is different.
   * @see ApiClientService.prepareRequestConfig()
   */
  requestConfig: AxiosRequestConfig = {};

  /**
   * The service logger.
   */
  protected logger = new ConsoleLogger(this.constructor.name);

  /**
   * API endpoints.
   */
  protected endpoints: {
    hosts: string;
    proxy: string;
  };

  /**
   * List of URLs that needs to be load tested.
   * @see ApiClientService.fetchUrls()
   */
  urls = new Set<string>();

  /**
   * List of proxies needs to be used for load testing.
   * @see ApiClientService.fetchProxies()
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
    this.endpoints = {
      hosts: this.configService.get('api.endpoints.hosts'),
      proxy: this.configService.get('api.endpoints.proxy'),
    };
    this.requestConfig = this.configService.get('api.requestConfig');
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
   * Note: method will be invoked each 5 minutes.
   */
  @Cron('0 */5 * * * *')
  protected async fetchUrls() {
    // Retrieve list of hosts from API.
    try {
      const { data: hostsList } = await lastValueFrom(
        this.axios.get<Array<string>>(this.endpoints.hosts, this.requestConfig),
      );
      this.logger.debug(`Fetching URLs from ${hostsList.length} hosts`);

      // Collect promises for run requests concurrently.
      const promises = hostsList.map((hostUrl) =>
        lastValueFrom(this.axios.get<HostResponseInterface>(hostUrl, this.requestConfig)),
      );
      // Run requests concurrently.
      const responses = await Promise.allSettled(promises);
      // Saves URLs as a new set.
      // NOTE: new set is needed because old targets might be outdated.
      this.urls = responses.reduce((urlSet, promise) => {
        if (promise.status === 'fulfilled') {
          urlSet.add(promise.value.data.site.page);
        }
        return urlSet;
      }, new Set<string>());
      this.logger.debug(`Fetched ${this.urls.size} URLs from ${this.endpoints.hosts}`);
    } catch (e) {
      if (!this.urls.size) {
        this.logger.error('[Hosts|Refresh] API error. Retrying...');
        await this.fetchUrls();
      } else {
        this.logger.warn('[Hosts|Refresh] API error. Using old values...');
      }
      return;
    }
  }

  /**
   * Fetches from API all the proxies that needs to be load tested.
   *
   * Note: method will be invoked each 5 minutes.
   */
  @Cron('0 0 * * * *') // Refresh proxies each hour.
  protected async fetchProxies() {
    try {
      const { data } = await lastValueFrom(
        this.axios.get<Array<ProxyInterface>>(this.endpoints.proxy, this.requestConfig),
      );
      // Transform response object to axios-compatible object.
      this.axiosProxies = data.map((proxy) => {
        const [username, password] = proxy.auth.split(':', 2);
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
      this.logger.debug(`Fetched ${this.axiosProxies.length} proxies from ${this.endpoints.proxy}`);
    } catch (e) {
      if (!this.urls.size) {
        this.logger.error('[Proxy|Refresh] API error. Retrying...');
        await this.fetchUrls();
      } else {
        this.logger.warn('[Proxy|Refresh] API error. Using old values...');
      }
    }
  }

  /**
   * Returns promise for the request to random host using random proxy.
   */
  prepareRequestConfig(url: string, timeout = 10000) {
    return {
      url,
      timeout, // 10 seconds.
      proxy: _sample(this.axiosProxies),
      headers: this.randomService.randomHeaders(),
      // Accept invalid certificates.
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      // Status code validation callback. Valid codes do not throw errors.
      validateStatus: (statusCode) => {
        // If >500: server is down.   We are happy.
        // If <300: server responded. We are happy.
        return statusCode >= 500 || statusCode < 300;
      },
    } as AxiosRequestConfig;
  }

  prepareRandomRequestConfig() {
    return this.prepareRequestConfig(_sample(Array.from(this.urls)));
  }
}
