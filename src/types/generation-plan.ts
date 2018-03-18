
export enum PlanType {
  INTERFACE,
  ARRAY,
  REFERENCE,
}

export interface GenerationPlan {
  declarations: Record<string, InterfacePlan | ArrayPlan>;
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
}

export interface PropertyPlan {
  type: TypePlan;
  name: string;
  optional: boolean;
}

export type TypePlan = ArrayPlan | InterfacePlan | ReferencePlan;
