import { SourceFile } from 'ts-simple-ast';
import { ArrayPlan } from '../../type-plans';
import { getTypeAsString } from '../../type-plans/utils';

export function addArrayTypeAlias(sourceFile: SourceFile, plan: ArrayPlan, name: string): void {
  sourceFile.addTypeAlias({
    name,
    type: `${getTypeAsString(plan.itemType, sourceFile)}[]`,
    isExported: true,
  });
}
