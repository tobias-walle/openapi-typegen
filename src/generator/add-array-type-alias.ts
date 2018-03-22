import { SourceFile } from 'ts-simple-ast';
import { ArrayPlan } from '../types/generation-plan';
import { getTypeAsString } from './get-type-as-string';

export function addArrayTypeAlias(sourceFile: SourceFile, plan: ArrayPlan, name: string): void {
  sourceFile.addTypeAlias({
    name,
    type: `${getTypeAsString(plan.itemType, sourceFile)}[]`,
    isExported: true,
  });
}
