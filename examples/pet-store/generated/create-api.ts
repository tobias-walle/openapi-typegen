import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { apiMapping, ApiMappingItem } from './api-mapping';
import { ApiOperationIds, ApiTypes } from './api-types';
import { applyParametersToAxiosRequestConfig, keys } from './api-utils';
import {
  ApiResponse,
  Category,
  Order,
  Pet,
  Tag,
  User
} from './definitions'

export type ApiParameters<K extends ApiOperationIds> = ApiTypes[K]['parameters'];
export type ApiResponses<K extends ApiOperationIds> = ApiTypes[K]['responses'];

export type ApiFetchParameters<K extends ApiOperationIds> = {
  [parameterType in keyof ApiParameters<K>]: ApiParameters<K>[parameterType]
};

export type ApiFetchFunction<K extends ApiOperationIds> =
  (parameters: ApiParameters<K>) => Promise<AxiosResponse<ApiResponses<K>['success']>>;

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

export interface Api {
  updatePet: (parameters: {
    body: Pet;
  }) => Promise<AxiosResponse<undefined>>;
  addPet: (parameters: {
    body: Pet;
  }) => Promise<AxiosResponse<undefined>>;
  findPetsByStatus: (parameters: {
    query: {
      status: Array<'available' | 'pending' | 'sold'>;
    };
  }) => Promise<AxiosResponse<Pet[]>>;
  findPetsByTags: (parameters: {
    query: {
      tags: string[];
    };
  }) => Promise<AxiosResponse<Pet[]>>;
  getPetById: (parameters: {
    path: {
      petId: number;
    };
  }) => Promise<AxiosResponse<Pet>>;
  updatePetWithForm: (parameters: {
    path: {
      petId: number;
    };
    formData: FormData | {
      name?: string;
      status?: string;
    };
  }) => Promise<AxiosResponse<undefined>>;
  deletePet: (parameters: {
    header: {
      api_key?: string;
    };
    path: {
      petId: number;
    };
  }) => Promise<AxiosResponse<undefined>>;
  uploadFile: (parameters: {
    path: {
      petId: number;
    };
    formData: FormData | {
      additionalMetadata?: string;
      file?: File;
    };
  }) => Promise<AxiosResponse<ApiResponse>>;
  getInventory: (parameters: {}) => Promise<AxiosResponse<{}>>;
  placeOrder: (parameters: {
    body: Order;
  }) => Promise<AxiosResponse<Order>>;
  getOrderById: (parameters: {
    path: {
      orderId: number;
    };
  }) => Promise<AxiosResponse<Order>>;
  deleteOrder: (parameters: {
    path: {
      orderId: number;
    };
  }) => Promise<AxiosResponse<undefined>>;
  createUser: (parameters: {
    body: User;
  }) => Promise<AxiosResponse<undefined>>;
  createUsersWithArrayInput: (parameters: {
    body: User[];
  }) => Promise<AxiosResponse<undefined>>;
  createUsersWithListInput: (parameters: {
    body: User[];
  }) => Promise<AxiosResponse<undefined>>;
  loginUser: (parameters: {
    query: {
      username: string;
      password: string;
    };
  }) => Promise<AxiosResponse<string>>;
  logoutUser: (parameters: {}) => Promise<AxiosResponse<undefined>>;
  getUserByName: (parameters: {
    path: {
      username: string;
    };
  }) => Promise<AxiosResponse<User>>;
  updateUser: (parameters: {
    path: {
      username: string;
    };
    body: User;
  }) => Promise<AxiosResponse<undefined>>;
  deleteUser: (parameters: {
    path: {
      username: string;
    };
  }) => Promise<AxiosResponse<undefined>>;
}
