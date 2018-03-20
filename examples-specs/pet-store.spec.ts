import axios, { AxiosRequestConfig } from 'axios';
import { ApiFetchParameters, createApi } from '../examples/pet-store/generated/create-api';
import { Pet } from '../examples/pet-store/generated/definitions';
import { ApiTypes } from './../examples/pet-store/generated/api-types';
jest.mock('axios');

describe('createApi', () => {
  it('should set body parameters', () => {
    const body: Pet = {
      name: 'Miao',
      photoUrls: '',
    };

    const api = createApi();
    api.addPet({ body });
    const expectedAxiosConfig: AxiosRequestConfig = {
      url: '/pet',
      method: 'post',
      data: body,
    };

    expect(axios).toHaveBeenCalledWith(expectedAxiosConfig);
  });

  it('should set query parameters', () => {
    const query = { status: ['pending' as 'pending'] };

    const api = createApi();
    api.findPetsByStatus({ query });
    const expectedAxiosConfig: AxiosRequestConfig = {
      url: '/pet/findByStatus',
      method: 'get',
      params: query,
    };

    expect(axios).toHaveBeenCalledWith(expectedAxiosConfig);
  });

  it('should set path parameters', () => {
    const path = { petId: 123 };

    const api = createApi();
    api.getPetById({ path });
    const expectedAxiosConfig: AxiosRequestConfig = {
      url: '/pet/123',
      method: 'get',
    };

    expect(axios).toHaveBeenCalledWith(expectedAxiosConfig);
  });

  it('should set formData parameters', () => {
    const expectedFormData = new FormData();
    expectedFormData.append('name', 'name');
    expectedFormData.append('status', 'status');

    const api = createApi();
    api.updatePetWithForm({
      path: {
        petId: 1,
      },
      formData: expectedFormData,
    });
    const expectedAxiosConfig: AxiosRequestConfig = {
      url: '/pet/1',
      method: 'post',
      data: expectedFormData,
    };

    expect(axios).toHaveBeenCalledWith(expectedAxiosConfig);
  });

  it('should set formData parameters with object', () => {
    const expectedFormData = new FormData();
    expectedFormData.append('name', 'name');
    expectedFormData.append('status', 'status');

    const api = createApi();
    api.updatePetWithForm({
      path: {
        petId: 1,
      },
      formData: {
        name: 'name',
        status: 'status',
      },
    });
    const expectedAxiosConfig: AxiosRequestConfig = {
      url: '/pet/1',
      method: 'post',
      data: expectedFormData,
    };

    expect(axios).toHaveBeenCalledWith(expectedAxiosConfig);
  });
});
