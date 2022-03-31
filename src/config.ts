import { AxiosRequestConfig } from 'axios';
import * as Joi from 'joi';

/**
 * Validation schema for environment variables.
 */
export function mainConfigValidationSchema() {
  return Joi.object({
    PORT: Joi.number().port().default(8080),
    UASHIELD_REQUEST_TIMEOUT: Joi.number().positive().default(10000),
    UASHIELD_USE_PROXY: Joi.string().valid('true', 'false').default('true'),
    UASHIELD_URLS: Joi.string().uri().required(),
    UASHIELD_PROXIES: Joi.string().uri().required(),
    UASHIELD_TARGETS: Joi.string().custom((value, helpers) => {
      const errorMessage: Joi.LanguageMessages = {
        custom: 'Needs to be valid JSON string with array of URLs as strings.',
      };
      try {
        // Try to parse json string.
        const parsed = JSON.parse(value);
        // If not an array.
        if (!Array.isArray(parsed)) return helpers.message(errorMessage);
        return value;
      } catch (e) {
        // Catch JSON.parse() errors.
        return helpers.message(errorMessage);
      }
    }),
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
    apis: {
      uashield: {
        endpoints: {
          urls: process.env.UASHIELD_URLS,
          proxy: process.env.UASHIELD_PROXIES,
        },
        targets: process.env.UASHIELD_TARGETS ? JSON.parse(process.env.UASHIELD_TARGETS) : [],
        useProxy: process.env.UASHIELD_USE_PROXY === 'true',
        axios: {
          timeout: +process.env.UASHIELD_REQUEST_TIMEOUT,
        },
      } as UashieldConfigInterface,
    },
    app: {
      // Application port for web server.
      port: +process.env.PORT,
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

export interface UashieldConfigInterface {
  endpoints: {
    urls: string;
    proxy: string;
  };
  targets: Array<string>;
  useProxy: boolean;
  axios: AxiosRequestConfig;
}
