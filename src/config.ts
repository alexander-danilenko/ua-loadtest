import { AxiosRequestConfig } from 'axios';
import * as Joi from 'joi';

/**
 * Validation schema for environment variables.
 */
export function mainConfigValidationSchema() {
  return Joi.object({
    PORT: Joi.number().default(8080),
    REQUESTS_CONCURRENCY: Joi.number().required(),
    API_ENDPOINT_HOSTS: Joi.string().uri().required(),
    API_ENDPOINT_PROXIES: Joi.string().uri().required(),
    LOG_SUMMARY_TABLE: Joi.string().valid('true', 'false').default('true'),
    LOG_CLEAR: Joi.string().valid('true', 'false').default('false'),
    LOG_RESPONSE_SUCCESS: Joi.string().valid('true', 'false').default('false'),
    LOG_RESPONSE_TIMEOUT: Joi.string().valid('true', 'false').default('false'),
    LOG_RESPONSE_ERROR: Joi.string().valid('true', 'false').default('false'),
  });
}

/**
 * Configuration object that uses env variables.
 * Config is accessible using ConfigService.
 * @see ConfigService
 */
export function config() {
  return {
    api: {
      endpoints: {
        hosts: process.env.API_ENDPOINT_HOSTS,
        proxy: process.env.API_ENDPOINT_PROXIES,
      },
      requestConfig: {
        timeout: +process.env.TIMEOUT,
      } as AxiosRequestConfig,
    },
    app: {
      // Application port for web server.
      port: +process.env.PORT,
      concurrency: +process.env.REQUESTS_CONCURRENCY,
      logging: {
        logSummaryTable: process.env.LOG_SUMMARY_TABLE === 'true',
        logClear: process.env.LOG_CLEAR === 'true',
        logSuccess: process.env.LOG_RESPONSE_SUCCESS === 'true',
        logTimeouts: process.env.LOG_RESPONSE_TIMEOUT === 'true',
        logErrors: process.env.LOG_RESPONSE_ERROR === 'true',
      } as LoggingConfigInterface,
    },
  };
}

export interface LoggingConfigInterface {
  logSummaryTable: boolean;
  logClear: boolean;
  logTimeouts: boolean;
  logErrors: boolean;
  logSuccess: boolean;
}
