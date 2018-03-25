export enum PlanType {
  INTERFACE,
  ARRAY,
  REFERENCE,
  UNION,
  FUNCTION,
}

export enum ParameterType {
  BODY = 'body',
  QUERY = 'query',
  FORM_DATA = 'formData',
  PATH = 'path',
}

export interface GenerationPlan {
  definitions: Record<string, InterfacePlan | ArrayPlan>;
  api: Record<string, ApiPlan>;
}

export interface ApiPlan {
  operationId: string;
  tags: string[];
  url: string;
  method: string;
  parameters: ApiParameterMappingPlan;
  responses: ApiResponseMappingPlan;
}

export interface ApiParameterMappingPlan {
  type: TypePlan;
  byParameterType: ApiParameterPlan[];
}

export interface ApiResponseMappingPlan {
  success: TypePlan;
  error: TypePlan;
  byStatusCode: ApiResponsePlan[];
}

export interface ApiParameterPlan {
  parameterType: ParameterType;
  items: ApiParameterPlanItem[];
}

export interface ApiParameterPlanItem {
  name: string;
  optional: boolean;
  payloadType?: TypePlan;
}

export interface ApiResponsePlan {
  statusCode: string;
  payloadType?: TypePlan;
}

export interface ArrayPlan {
  type: PlanType.ARRAY;
  itemType: TypePlan;
}

export interface InterfacePlan {
  type: PlanType.INTERFACE;
  properties: PropertyPlan[];
}

export interface ReferencePlan {
  type: PlanType.REFERENCE;
  to: string;
  generics?: TypePlan[];
  libType?: boolean;
}

export interface UnionTypePlan {
  type: PlanType.UNION;
  types: TypePlan[];
}

export interface FunctionTypePlan {
  type: PlanType.FUNCTION;
  arguments: FunctionTypeArgumentPlan[];
  returnType: TypePlan;
}

export interface FunctionTypeArgumentPlan {
  type: TypePlan;
  name: string;
}

export interface PropertyPlan {
  type: TypePlan;
  name: string;
  optional: boolean;
}

export type TypePlan = ArrayPlan | InterfacePlan | ReferencePlan | UnionTypePlan | FunctionTypePlan;
