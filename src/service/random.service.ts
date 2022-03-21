import { AxiosProxyConfig, AxiosRequestConfig } from 'axios';
import https from 'https';
import { sample as _sample } from 'lodash';
import { lastValueFrom } from 'rxjs';
import { SocksProxyAgent } from 'socks-proxy-agent';
import UserAgent from 'user-agents';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

/**
 * Service for generating any kind of random things.
 */
@Injectable()
export class RandomService {
  constructor(protected readonly axios: HttpService) {}

  /**
   * Returns axios request object to random url with random proxy.
   */
  buildRandomRequest(urls: Set<string>, proxies: Array<AxiosProxyConfig>, config: AxiosRequestConfig = {}) {
    return lastValueFrom(
      this.axios.request(this.buildRequestConfig(_sample(Array.from(urls)), _sample(proxies), config)),
    );
  }

  /**
   * Returns axios config for making request to certain url with certain proxy.
   */
  buildRequestConfig(url: string, proxy: AxiosProxyConfig, config: AxiosRequestConfig = {}) {
    const requestConfig: AxiosRequestConfig = {
      ...config,
      url,
      headers: this.randomHeaders(),
      // Status code validation callback. Valid codes do not throw errors.
      validateStatus: (statusCode) => {
        // If >500: server is down.   We are happy.
        // If <300: server responded. We are happy.
        return statusCode >= 500 || statusCode < 300;
      },
    };

    switch (proxy.protocol) {
      case 'socks4':
      case 'socks5':
        requestConfig.httpsAgent = requestConfig.httpAgent = new SocksProxyAgent(
          `${proxy.protocol}://${proxy.host}:${proxy.port}`,
          {
            timeout: 2000, // 2 seconds is less than total request timeout.
          },
        );
        break;

      default:
        requestConfig.proxy = proxy;
        // Accept invalid certificates.
        requestConfig.httpsAgent = new https.Agent({ rejectUnauthorized: false });
    }

    return requestConfig;
  }

  randomInt(number: number): number {
    return Math.floor(Math.random() * number);
  }

  randomBool(): boolean {
    return Math.random() < 0.5;
  }

  randomHeaders() {
    return {
      ...this.userAgent(),
      ...this.accept(),
      ...this.acceptLanguage(),
      ...this.getAdditionalRandomHeaders(),
    };
  }

  private getAdditionalRandomHeaders() {
    let headers = {};
    if (this.randomBool()) {
      headers = { ...headers, ...this.referer() };
    }
    if (this.randomBool()) {
      headers = { ...headers, ...this.cacheControl() };
    }
    if (this.randomBool()) {
      headers = { ...headers, ...this.upgradeInsecureRequest() };
    }
    if (this.randomBool()) {
      headers = { ...headers, ...this.acceptEncoding() };
    }
    if (this.randomBool()) {
      headers = { ...headers, ...this.secHeaders() };
    }
    return headers;
  }

  private acceptEncoding() {
    return {
      'Accept-Encoding': 'gzip, deflate, br',
    };
  }

  private upgradeInsecureRequest() {
    return {
      'Upgrade-Insecure-Requests': 1,
    };
  }

  private acceptLanguage() {
    const options = ['ru-RU,ru', 'ru,en;q=0.9,en-US;q=0.8'];
    return { 'Accept-Language': options[this.randomInt(options.length)] };
  }

  private secHeaders() {
    return {
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'sec-fetch-dest': 'document',
      'sec-fetch-user': '?1',
      'sec-ch-ua-platform': 'Windows',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="98", "Google Chrome";v="98"',
    };
  }

  private accept() {
    return {
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    };
  }

  private userAgent() {
    return {
      'User-Agent': new UserAgent().toString(),
    };
  }

  private cacheControl() {
    const options = ['no-cache', 'max-age=0'];
    return { 'Cache-Control': options[this.randomInt(options.length)] };
  }

  private referer() {
    const options = [
      'https://www.google.com/',
      'https://vk.com/',
      'https://go.mail.ru/search/',
      'https://yandex.ru/search/',
      'https://yandex.ru/search/', // don't remove the second line this is on purpose
    ];
    return { Referer: options[this.randomInt(options.length)] };
  }
}
