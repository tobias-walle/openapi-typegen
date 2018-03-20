import { AxiosRequestConfig } from 'axios';
import { ParameterTypes } from './api-types';
import { ApiFetchParameters } from './create-api';

type AddPayloadFunction = (config: AxiosRequestConfig, payload: object) => void;

const addPayloadFor: Record<ParameterTypes, AddPayloadFunction> = {
    body: (config, body) => config.data = body,
    query: (config, query) => config.params = query,
    formData: (config, formData) => config.data = formData instanceof FormData
        ? formData
        : mapObjectToFromData(formData),
    path: (config, path) => config.url = replacePathParameterInUrl(config.url, path),
};

function replacePathParameterInUrl(baseUrl: string, pathParameter: object): string {
    return Object.keys(pathParameter)
        .reduce((url, name) => url.replace(
            `{${name}}`,
            encodeURIComponent(pathParameter[name]),
        ), baseUrl);
}

function mapObjectToFromData(object: object): FormData {
    return Object.keys(object)
        .reduce((formData, key) => {
            formData.append(key, object[key]);
            return formData;
        }, new FormData());
}

export function applyParametersToAxiosRequestConfig(
    config: AxiosRequestConfig,
    parameters: ApiFetchParameters<any>,
): void {
    Object.keys(parameters)
        .forEach((parameterType) => {
            const payload = parameters[parameterType];
            addPayloadFor[parameterType](config, payload);
        });
}
