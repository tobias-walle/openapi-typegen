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
    addPet: {
        url: '/pet',
        method: 'post',
        tags: [
            'pet',
        ],
    },
    updatePet: {
        url: '/pet',
        method: 'put',
        tags: [
            'pet',
        ],
    },
    findPetsByStatus: {
        url: '/pet/findByStatus',
        method: 'get',
        tags: [
            'pet',
        ],
    },
    findPetsByTags: {
        url: '/pet/findByTags',
        method: 'get',
        tags: [
            'pet',
        ],
    },
    getPetById: {
        url: '/pet/{petId}',
        method: 'get',
        tags: [
            'pet',
        ],
    },
    updatePetWithForm: {
        url: '/pet/{petId}',
        method: 'post',
        tags: [
            'pet',
        ],
    },
    deletePet: {
        url: '/pet/{petId}',
        method: 'delete',
        tags: [
            'pet',
        ],
    },
    uploadFile: {
        url: '/pet/{petId}/uploadImage',
        method: 'post',
        tags: [
            'pet',
        ],
    },
};
