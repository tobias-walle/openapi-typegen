import { PlanType } from '../types/generation-plan';
import { addArrayTypeAlias } from './add-array-type-alias';
import { addInterface } from './add-interface';
import { Generator } from './generator';

export class DefinitionsGenerator extends Generator {
  public generate() {
    const { generationPlan } = this.args;

    const sourceFile = this.setupFile('definitions.ts');

    Object.entries(generationPlan.definitions)
      .forEach(([name, plan]) => plan.type === PlanType.INTERFACE
        ? addInterface(sourceFile, plan, name)
        : addArrayTypeAlias(sourceFile, plan, name),
      );
  }
}
