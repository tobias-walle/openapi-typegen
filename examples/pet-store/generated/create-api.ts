import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { apiMapping, ApiMappingItem } from './api-mapping';
import { ApiOperationIds, ApiTypes } from './api-types';
import { applyParametersToAxiosRequestConfig, keys } from './api-utils';

export type ApiParameters<K extends ApiOperationIds> = ApiTypes[K]['parameters'];
export type ApiResponses<K extends ApiOperationIds> = ApiTypes[K]['responses'];

export type ApiFetchParameters<K extends ApiOperationIds> = {
  [parameterType in keyof ApiParameters<K>]: ApiParameters<K>[parameterType]
};

export type ApiFetchFunction<K extends ApiOperationIds> =
  (parameters: ApiParameters<K>) => Promise<AxiosResponse<ApiResponses<K>['success']>>;

export type Api = {
  [key in ApiOperationIds]: ApiFetchFunction<key>
};

export function createApi(): Api {
  return keys(apiMapping)
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
