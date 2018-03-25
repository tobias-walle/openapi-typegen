import { addArrayTypeAlias, addInterface } from './utils';
import { TypePlanType } from '../type-plans';
import { Generator } from '../types/generator';

export class DefinitionsGenerator extends Generator {
  public generate() {
    const { generationPlan } = this.args;

    const sourceFile = this.setupFile('definitions.ts');

    Object.entries(generationPlan.definitions)
      .forEach(([name, plan]) => plan.type === TypePlanType.INTERFACE
        ? addInterface(sourceFile, plan, name)
        : addArrayTypeAlias(sourceFile, plan, name),
      );
  }
}
