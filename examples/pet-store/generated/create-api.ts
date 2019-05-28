import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { apiMapping, ApiMappingItem } from './api-mapping';
import { ApiOperationIds, ApiTypes } from './api-types';
import { applyParametersToAxiosRequestConfig, joinUrl, keys } from './api-utils';
import {
  ApiResponse,
  Category,
  Order,
  Pet,
  Tag,
  User
} from './definitions';

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
  const url = joinUrl(apiOptions.baseUrl, mappingItem.url);
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
}

const defaultApiOptions: ApiOptions = {
  baseUrl: 'http://petstore.swagger.io/v2'
};

export interface Api {
  /**
   * Update an existing pet
   */
  updatePet: (parameters: {
    body: Pet;
  }) => Promise<AxiosResponse<undefined>>;
  /**
   * Add a new pet to the store
   */
  addPet: (parameters: {
    body: Pet;
  }) => Promise<AxiosResponse<undefined>>;
  /**
   * Finds Pets by status
   */
  findPetsByStatus: (parameters: {
    query: {
      status: Array<'available' | 'pending' | 'sold'>;
    };
  }) => Promise<AxiosResponse<Pet[]>>;
  /**
   * Finds Pets by tags
   */
  findPetsByTags: (parameters: {
    query: {
      tags: string[];
    };
  }) => Promise<AxiosResponse<Pet[]>>;
  /**
   * Find pet by ID
   */
  getPetById: (parameters: {
    path: {
      petId: number;
    };
  }) => Promise<AxiosResponse<Pet>>;
  /**
   * Updates a pet in the store with form data
   */
  updatePetWithForm: (parameters: {
    formData: FormData | {
      name?: string;
      status?: string;
    };
    path: {
      petId: number;
    };
  }) => Promise<AxiosResponse<undefined>>;
  /**
   * Deletes a pet
   */
  deletePet: (parameters: {
    header: {
      api_key?: string;
    };
    path: {
      petId: number;
    };
  }) => Promise<AxiosResponse<undefined>>;
  /**
   * uploads an image
   */
  uploadFile: (parameters: {
    formData: FormData | {
      additionalMetadata?: string;
      file?: File;
    };
    path: {
      petId: number;
    };
  }) => Promise<AxiosResponse<ApiResponse>>;
  /**
   * Returns pet inventories by status
   */
  getInventory: (parameters: {}) => Promise<AxiosResponse<{}>>;
  /**
   * Place an order for a pet
   */
  placeOrder: (parameters: {
    body: Order;
  }) => Promise<AxiosResponse<Order>>;
  /**
   * Find purchase order by ID
   */
  getOrderById: (parameters: {
    path: {
      orderId: number;
    };
  }) => Promise<AxiosResponse<Order>>;
  /**
   * Delete purchase order by ID
   */
  deleteOrder: (parameters: {
    path: {
      orderId: number;
    };
  }) => Promise<AxiosResponse<undefined>>;
  /**
   * Create user
   */
  createUser: (parameters: {
    body: User;
  }) => Promise<AxiosResponse<undefined>>;
  /**
   * Creates list of users with given input array
   */
  createUsersWithArrayInput: (parameters: {
    body: User[];
  }) => Promise<AxiosResponse<undefined>>;
  /**
   * Creates list of users with given input array
   */
  createUsersWithListInput: (parameters: {
    body: User[];
  }) => Promise<AxiosResponse<undefined>>;
  /**
   * Logs user into the system
   */
  loginUser: (parameters: {
    query: {
      username: string;
      password: string;
    };
  }) => Promise<AxiosResponse<string>>;
  /**
   * Logs out current logged in user session
   */
  logoutUser: (parameters: {}) => Promise<AxiosResponse<undefined>>;
  /**
   * Get user by user name
   */
  getUserByName: (parameters: {
    path: {
      username: string;
    };
  }) => Promise<AxiosResponse<User>>;
  /**
   * Updated user
   */
  updateUser: (parameters: {
    body: User;
    path: {
      username: string;
    };
  }) => Promise<AxiosResponse<undefined>>;
  /**
   * Delete user
   */
  deleteUser: (parameters: {
    path: {
      username: string;
    };
  }) => Promise<AxiosResponse<undefined>>;
}
