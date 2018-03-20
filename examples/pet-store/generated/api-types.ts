import { ApiResponse, Pet } from './definitions';

export enum ParameterTypes {
    BODY = 'body',
    QUERY = 'query',
    FORM_DATA = 'formData',
    PATH = 'path',
}

export interface AbstractApiTypes {
    parameters: { [type in ParameterTypes]?: object };
    responses: { [statusCode: number]: any };
}

export type ApiOperationIds = keyof ApiTypes;

export interface ApiTypes {
    addPet: {
        tag: 'pet',
        parameters: {
            body: Pet,
        },
        responses: {
            405: never,
        },
    };
    updatePet: {
        tag: 'pet',
        parameters: {
            body: Pet,
        },
        responses: {
            400: never,
            404: never,
            405: never,
        },
    };
    findPetsByStatus: {
        tag: 'pet',
        parameters: {
            query: {
                status: Array<'available' | 'pending' | 'sold'>,
            },
        },
        responses: {
            200: Array<Pet>,
            400: never,
        },
    };
    findPetsByTags: {
        tag: 'pet',
        parameters: {
            query: {
                tags: Array<string>,
            },
        },
        responses: {
            200: Array<Pet>,
            400: never,
        },
    };
    getPetById: {
        tag: 'pet',
        parameters: {
            path: {
                petId: number,
            },
        },
        responses: {
            200: Pet,
            400: never,
            404: never,
        },
    };
    updatePetWithForm: {
        tag: 'pet',
        parameters: {
            path: {
                petId: number,
            };
            formData: FormData | {
                name?: string,
                status?: string,
            }
        },
        responses: {
            405: never;
        },
    };
    deletePet: {
        tag: 'pet',
        parameters: {
            header: {
                api_key?: string,
            },
            path: {
                petId: number,
            },
        },
        responses: {
            400: never,
            404: never,
        },
    };
    uploadFile: {
        tag: 'pet',
        parameters: {
            path: {
                petId: number,
            },
            formData: FormData | {
                additionalMetadata?: string,
                file?: File,
            },
        },
        responses: {
            200: ApiResponse,
        },
    };
}
