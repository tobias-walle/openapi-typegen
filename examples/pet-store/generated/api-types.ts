import {
  ApiResponse,
  Category,
  Order,
  Pet,
  Tag,
  User
} from './definitions'

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
      success: undefined;
      error: undefined;
    };
  };
  addPet: {
    tag: 'pet';
    parameters: {
      body: Pet;
    };
    responses: {
      success: undefined;
      error: undefined;
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
      success: Pet[];
      error: undefined;
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
      success: Pet[];
      error: undefined;
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
      success: Pet;
      error: undefined;
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
      success: undefined;
      error: undefined;
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
      success: undefined;
      error: undefined;
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
      success: ApiResponse;
      error: undefined;
    };
  };
  getInventory: {
    tag: 'store';
    parameters: {};
    responses: {
      success: {};
      error: undefined;
    };
  };
  placeOrder: {
    tag: 'store';
    parameters: {
      body: Order;
    };
    responses: {
      success: Order;
      error: undefined;
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
      success: Order;
      error: undefined;
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
      success: undefined;
      error: undefined;
    };
  };
  createUser: {
    tag: 'user';
    parameters: {
      body: User;
    };
    responses: {
      success: undefined;
      error: undefined;
    };
  };
  createUsersWithArrayInput: {
    tag: 'user';
    parameters: {
      body: User[];
    };
    responses: {
      success: undefined;
      error: undefined;
    };
  };
  createUsersWithListInput: {
    tag: 'user';
    parameters: {
      body: User[];
    };
    responses: {
      success: undefined;
      error: undefined;
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
      success: string;
      error: undefined;
    };
  };
  logoutUser: {
    tag: 'user';
    parameters: {};
    responses: {
      success: undefined;
      error: undefined;
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
      success: User;
      error: undefined;
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
      success: undefined;
      error: undefined;
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
      success: undefined;
      error: undefined;
    };
  };
}
