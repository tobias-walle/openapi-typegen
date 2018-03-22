export enum PlanType {
  INTERFACE,
  ARRAY,
  REFERENCE,
  UNION,
}

export enum ParameterType {
  BODY = 'body',
  QUERY = 'query',
  FORM_DATA = 'formData',
  PATH = 'path',
}

export interface GenerationPlan {
  declarations: Record<string, InterfacePlan | ArrayPlan>;
  api: Record<string, ApiPlan>;
}

export interface ApiPlan {
  operationId: string;
  tags: string[];
  url: string;
  method: string;
  parameters: ApiParameterPlan[];
  responses: ApiResponsePlan[];
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
  statusCode: string,
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
  libType?: boolean;
}

export interface UnionTypePlan {
  type: PlanType.UNION;
  types: TypePlan[];
}

export interface PropertyPlan {
  type: TypePlan;
  name: string;
  optional: boolean;
}

export type TypePlan = ArrayPlan | InterfacePlan | ReferencePlan | UnionTypePlan;
