import { ApiOperationIds, ApiTypes } from './api-types';

export interface ApiMappingItem<key extends ApiOperationIds> {
  url: string;
  method: string;
  tags: Array<ApiTypes[key]['tag']>;
}

export type ApiMapping = {
  [key in keyof ApiTypes]: ApiMappingItem<key>
};

export const apiMapping: ApiMapping = {
  updatePet: {
    url: '/pet',
    method: 'put',
    tags: [
      'pet'
    ]
  },
  addPet: {
    url: '/pet',
    method: 'post',
    tags: [
      'pet'
    ]
  },
  findPetsByStatus: {
    url: '/pet/findByStatus',
    method: 'get',
    tags: [
      'pet'
    ]
  },
  findPetsByTags: {
    url: '/pet/findByTags',
    method: 'get',
    tags: [
      'pet'
    ]
  },
  getPetById: {
    url: '/pet/{petId}',
    method: 'get',
    tags: [
      'pet'
    ]
  },
  updatePetWithForm: {
    url: '/pet/{petId}',
    method: 'post',
    tags: [
      'pet'
    ]
  },
  deletePet: {
    url: '/pet/{petId}',
    method: 'delete',
    tags: [
      'pet'
    ]
  },
  uploadFile: {
    url: '/pet/{petId}/uploadImage',
    method: 'post',
    tags: [
      'pet'
    ]
  },
  getInventory: {
    url: '/store/inventory',
    method: 'get',
    tags: [
      'store'
    ]
  },
  placeOrder: {
    url: '/store/order',
    method: 'post',
    tags: [
      'store'
    ]
  },
  getOrderById: {
    url: '/store/order/{orderId}',
    method: 'get',
    tags: [
      'store'
    ]
  },
  deleteOrder: {
    url: '/store/order/{orderId}',
    method: 'delete',
    tags: [
      'store'
    ]
  },
  createUser: {
    url: '/user',
    method: 'post',
    tags: [
      'user'
    ]
  },
  createUsersWithArrayInput: {
    url: '/user/createWithArray',
    method: 'post',
    tags: [
      'user'
    ]
  },
  createUsersWithListInput: {
    url: '/user/createWithList',
    method: 'post',
    tags: [
      'user'
    ]
  },
  loginUser: {
    url: '/user/login',
    method: 'get',
    tags: [
      'user'
    ]
  },
  logoutUser: {
    url: '/user/logout',
    method: 'get',
    tags: [
      'user'
    ]
  },
  getUserByName: {
    url: '/user/{username}',
    method: 'get',
    tags: [
      'user'
    ]
  },
  updateUser: {
    url: '/user/{username}',
    method: 'put',
    tags: [
      'user'
    ]
  },
  deleteUser: {
    url: '/user/{username}',
    method: 'delete',
    tags: [
      'user'
    ]
  }
};
