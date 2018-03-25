import { PlanType, ReferencePlan, TypePlan, UnionTypePlan } from '../types/generation-plan';

export const formDataTypePlan: ReferencePlan = {
  type: PlanType.REFERENCE,
  to: 'FormData',
  libType: true,
};

export const anyTypePlan: ReferencePlan = {
  type: PlanType.REFERENCE,
  to: 'any',
  libType: true,
};

export const undefinedPlan: ReferencePlan = {
  type: PlanType.REFERENCE,
  to: 'undefined',
  libType: true,
};

export function asPromise(typePlan: TypePlan): ReferencePlan {
  return {
    type: PlanType.REFERENCE,
    to: 'Promise',
    generics: [typePlan],
    libType: true,
  };
}

export function createUnionTypePlanFromStrings(strings: string[]): UnionTypePlan {
  return {
    type: PlanType.UNION,
    types: strings.map(createStringLiteralTypePlan),
  };
}

export function createStringLiteralTypePlan(str: string): ReferencePlan {
  return {
    type: PlanType.REFERENCE,
    to: `'${str}'`,
    libType: true,
  };
}
