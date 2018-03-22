import { Generator } from './generator';

export class AxiosGenerator extends Generator {
  public generate(): void {
    this.setupFile('api-utils.ts', apiUtilsTemplate);
    this.setupFile('create-api.ts', createApiTemplate);
  }
}

const apiUtilsTemplate = `
import { AxiosRequestConfig } from 'axios';
import { ParameterType } from './api-types';

type AddPayloadFunction = (config: AxiosRequestConfig, payload: object) => void;

export function keys<T>(object: T): (keyof T)[] {
  return Object.keys(object) as any[];
}

const addPayloadFor: Record<ParameterType, AddPayloadFunction> = {
  body: (config, body) => config.data = body,
  query: (config, query) => config.params = query,
  formData: (config, formData) => config.data = formData instanceof FormData
    ? formData
    : mapObjectToFromData(formData),
  path: (config, path) => config.url = replacePathParameterInUrl(config.url!, path),
};

function replacePathParameterInUrl(baseUrl: string, pathParameter: Record<string, any>): string {
  return Object.keys(pathParameter)
    .reduce((url, name) => url.replace(
      \`{$\{name}}\`,
      encodeURIComponent(pathParameter[name]),
    ), baseUrl);
}

function mapObjectToFromData(object: Record<string, any>): FormData {
  return Object.keys(object)
    .reduce((formData, key) => {
      formData.append(key, object[key]);
      return formData;
    }, new FormData());
}

export type AbstractApiFetchParameters = {
  [parameterType in ParameterType]?: any
};

export function applyParametersToAxiosRequestConfig(
  config: AxiosRequestConfig,
  parameters: AbstractApiFetchParameters,
): void {
  keys(parameters)
    .forEach((parameterType) => {
      const payload = parameters[parameterType];
      addPayloadFor[parameterType](config, payload);
    });
}
`.trim();

const createApiTemplate = `
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { apiMapping, ApiMappingItem } from './api-mapping';
import { ApiOperationIds, ApiTypes } from './api-types';
import { applyParametersToAxiosRequestConfig } from './api-utils';

export type ApiParameters<K extends ApiOperationIds> = ApiTypes[K]['parameters'];

export type ApiFetchParameters<K extends ApiOperationIds> = {
  [parameterType in keyof ApiParameters<K>]: ApiParameters<K>[parameterType]
  };

export type ApiFetchFunction<key extends ApiOperationIds> =
  (parameters: ApiParameters<key>) => Promise<AxiosResponse>;

export type Api = {
  [key in ApiOperationIds]: ApiFetchFunction<key>
  };

export function createApi(): Api {
  return Object.keys(apiMapping)
    .reduce((api, operationId) => ({
      ...api,
      [operationId]: createApiFetchFunction(apiMapping[operationId]),
    }), {} as Api);
}

function createApiFetchFunction<K extends ApiOperationIds>(mappingItem: ApiMappingItem<K>): ApiFetchFunction<K> {
  return (parameters: ApiFetchParameters<K>) => {
    const axiosRequestConfig: AxiosRequestConfig = {
      url: mappingItem.url,
      method: mappingItem.method,
    };
    applyParametersToAxiosRequestConfig(axiosRequestConfig, parameters);
    return axios(axiosRequestConfig);
  };
}
`.trim();
