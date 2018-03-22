import { ApiResponse, Order, Pet, User } from './definitions';

export enum ParameterType {
  BODY = 'body',
  QUERY = 'query',
  FORM_DATA = 'formData',
  PATH = 'path',
}

export type ApiOperationIds = keyof ApiTypes;

export interface ApiTypes {
  updatePet: {
    tag: 'pet';
    parameters: {
      body: Pet;
    };
    responses: {
      400: never;
      404: never;
      405: never;
    };
  };
  addPet: {
    tag: 'pet';
    parameters: {
      body: Pet;
    };
    responses: {
      405: never;
    };
  };
  findPetsByStatus: {
    tag: 'pet';
    parameters: {
      query: {
        status: Array<'available' | 'pending' | 'sold'>;
      };
    };
    responses: {
      200: Pet[];
      400: never;
    };
  };
  findPetsByTags: {
    tag: 'pet';
    parameters: {
      query: {
        tags: string[];
      };
    };
    responses: {
      200: Pet[];
      400: never;
    };
  };
  getPetById: {
    tag: 'pet';
    parameters: {
      path: {
        petId: number;
      };
    };
    responses: {
      200: Pet;
      400: never;
      404: never;
    };
  };
  updatePetWithForm: {
    tag: 'pet';
    parameters: {
      path: {
        petId: number;
      };
      formData: FormData | {
        name?: string;
        status?: string;
      };
    };
    responses: {
      405: never;
    };
  };
  deletePet: {
    tag: 'pet';
    parameters: {
      header: {
        api_key?: string;
      };
      path: {
        petId: number;
      };
    };
    responses: {
      400: never;
      404: never;
    };
  };
  uploadFile: {
    tag: 'pet';
    parameters: {
      path: {
        petId: number;
      };
      formData: FormData | {
        additionalMetadata?: string;
        file?: File;
      };
    };
    responses: {
      200: ApiResponse;
    };
  };
  getInventory: {
    tag: 'store';
    parameters: {};
    responses: {
      200: {};
    };
  };
  placeOrder: {
    tag: 'store';
    parameters: {
      body: Order;
    };
    responses: {
      200: Order;
      400: never;
    };
  };
  getOrderById: {
    tag: 'store';
    parameters: {
      path: {
        orderId: number;
      };
    };
    responses: {
      200: Order;
      400: never;
      404: never;
    };
  };
  deleteOrder: {
    tag: 'store';
    parameters: {
      path: {
        orderId: number;
      };
    };
    responses: {
      400: never;
      404: never;
    };
  };
  createUser: {
    tag: 'user';
    parameters: {
      body: User;
    };
    responses: {
      default: never;
    };
  };
  createUsersWithArrayInput: {
    tag: 'user';
    parameters: {
      body: User[];
    };
    responses: {
      default: never;
    };
  };
  createUsersWithListInput: {
    tag: 'user';
    parameters: {
      body: User[];
    };
    responses: {
      default: never;
    };
  };
  loginUser: {
    tag: 'user';
    parameters: {
      query: {
        username: string;
        password: string;
      };
    };
    responses: {
      200: string;
      400: never;
    };
  };
  logoutUser: {
    tag: 'user';
    parameters: {};
    responses: {
      default: never;
    };
  };
  getUserByName: {
    tag: 'user';
    parameters: {
      path: {
        username: string;
      };
    };
    responses: {
      200: User;
      400: never;
      404: never;
    };
  };
  updateUser: {
    tag: 'user';
    parameters: {
      path: {
        username: string;
      };
      body: User;
    };
    responses: {
      400: never;
      404: never;
    };
  };
  deleteUser: {
    tag: 'user';
    parameters: {
      path: {
        username: string;
      };
    };
    responses: {
      400: never;
      404: never;
    };
  };
}
