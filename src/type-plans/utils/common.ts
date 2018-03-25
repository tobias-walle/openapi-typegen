import { ReferencePlan, TypePlan, TypePlanType, UnionTypePlan } from '../types';

export const formDataTypePlan: ReferencePlan = {
  type: TypePlanType.REFERENCE,
  to: 'FormData',
  libType: true,
};

export const anyTypePlan: ReferencePlan = {
  type: TypePlanType.REFERENCE,
  to: 'any',
  libType: true,
};

export const undefinedPlan: ReferencePlan = {
  type: TypePlanType.REFERENCE,
  to: 'undefined',
  libType: true,
};

export function asPromise(typePlan: TypePlan): ReferencePlan {
  return {
    type: TypePlanType.REFERENCE,
    to: 'Promise',
    generics: [typePlan],
    libType: true,
  };
}

export function createUnionTypePlanFromStrings(strings: string[]): UnionTypePlan {
  return {
    type: TypePlanType.UNION,
    types: strings.map(createStringLiteralTypePlan),
  };
}

export function createStringLiteralTypePlan(str: string): ReferencePlan {
  return {
    type: TypePlanType.REFERENCE,
    to: `'${str}'`,
    libType: true,
  };
}
