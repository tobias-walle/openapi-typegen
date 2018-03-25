import { PropertySignatureStructure, SourceFile, VariableDeclarationType } from 'ts-simple-ast';
import { ApiPlan, FunctionTypePlan, TypePlanType } from '../type-plans';
import { asPromise, getDefinitionsImport, getTypeAsString } from '../type-plans/utils';
import { Generator } from '../types/generator';
import { convertObjectToString } from './utils';

export class AxiosGenerator extends Generator {
  public generate(): void {
    this.setupFile('api-utils.ts', apiUtilsTemplate);
    const createApiSource = this.addDefinitionImports(createApiTemplate);
    const createApiSourceFile = this.setupFile('create-api.ts', createApiSource);
    this.addDefaultApiOptions(createApiSourceFile);
    this.addApiInterface(createApiSourceFile);
  }

  private addDefinitionImports(template: string): string {
    return template.replace('{{imports}}', getDefinitionsImport(this.args.generationPlan.definitions));
  }

  private addDefaultApiOptions(sourceFile: SourceFile): void {
    const { generationPlan: { meta }, project } = this.args;
    sourceFile.addVariableStatement({
      declarationType: VariableDeclarationType.Const,
      declarations: [{
        name: 'defaultApiOptions',
        type: 'ApiOptions',
        initializer: convertObjectToString({
          ...meta.baseUrl ? { baseUrl: meta.baseUrl } : {},
          ...meta.host ? { host: meta.host } : {},
        }, project.manipulationSettings.getQuoteType())
      }]
    });
  }

  private addApiInterface(sourceFile: SourceFile): void {
    sourceFile.addInterface({
      name: 'Api',
      properties: this.getApiProperties(sourceFile),
      isExported: true,
    });
  }

  private getApiProperties(sourceFile: SourceFile): PropertySignatureStructure[] {
    const { generationPlan } = this.args;
    return Object.values(generationPlan.api)
      .map(apiPlan => this.getApiFetchFunctionProperty(apiPlan, sourceFile));
  }

  private getApiFetchFunctionProperty(apiPlan: ApiPlan, sourceFile: SourceFile): PropertySignatureStructure {
    const functionPlan: FunctionTypePlan = {
      type: TypePlanType.FUNCTION,
      returnType: asPromise(
        {
          type: TypePlanType.REFERENCE,
          to: 'AxiosResponse',
          generics: [apiPlan.responses.success]
        },
      ),
      arguments: [{
        name: 'parameters',
        type: apiPlan.parameters.type,
      }]
    };
    return {
      name: apiPlan.operationId,
      type: getTypeAsString(functionPlan, sourceFile),
      ...apiPlan.docs ? {
        docs: [{ description: apiPlan.docs }]
      } : {},
    };
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
      part = \`/$\{part}\`;
    }
    result += part;
  });
  return result;
}
`.trim();

const createApiTemplate = `
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { apiMapping, ApiMappingItem } from './api-mapping';
import { ApiOperationIds, ApiTypes } from './api-types';
import { applyParametersToAxiosRequestConfig, joinUrl, keys } from './api-utils';
{{imports}}

export function createApi(options: ApiOptions = {}): Api {
  options = Object.assign({}, defaultApiOptions, options);
  return keys(apiMapping)
    .reduce((api, operationId) => ({
      ...api,
      [operationId]: createApiFetchFunction(apiMapping[operationId], options),
    }), {} as Api);
}

function createApiFetchFunction<K extends ApiOperationIds>(
  mappingItem: ApiMappingItem<K>,
  apiOptions: ApiOptions
): ApiFetchFunction<K> {
  const url = joinUrl(apiOptions.host, apiOptions.baseUrl, mappingItem.url);
  return (parameters: ApiFetchParameters<K>) => {
    const axiosRequestConfig: AxiosRequestConfig = { url, method: mappingItem.method };
    applyParametersToAxiosRequestConfig(axiosRequestConfig, parameters);
    return axios(axiosRequestConfig);
  };
}

export type ApiParameters<K extends ApiOperationIds> = ApiTypes[K]['parameters'];

export type ApiResponses<K extends ApiOperationIds> = ApiTypes[K]['responses'];

export type ApiFetchParameters<K extends ApiOperationIds> = {
  [parameterType in keyof ApiParameters<K>]: ApiParameters<K>[parameterType]
};

export type ApiFetchFunction<K extends ApiOperationIds> =
  (parameters: ApiParameters<K>) => Promise<AxiosResponse<ApiResponses<K>['success']>>;

export interface ApiOptions {
  baseUrl?: string;
  host?: string;
}
`.trim();
