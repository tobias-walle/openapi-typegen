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
      `{${name}}`,
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

export function joinUrl(...parts: (string | undefined)[]): string {
  let result = '';
  parts.forEach((part) => {
    if (part == null || part.length === 0) {
      return;
    }
    const resultEndsWithSeparator = result[result.length - 1] === '/';
    const partStartWithSeparator = part[0] === '/';
    if (resultEndsWithSeparator && partStartWithSeparator) {
      part = part.substring(1);
    } else if (!resultEndsWithSeparator && !partStartWithSeparator && result.length > 0) {
      part = `/${part}`;
    }
    result += part;
  });
  return result;
}
