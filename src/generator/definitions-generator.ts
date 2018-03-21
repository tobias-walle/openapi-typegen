import { SourceFile } from 'ts-simple-ast';
import { ArrayPlan, InterfacePlan, PlanType, PropertyPlan } from '../types/generation-plan';
import { Generator } from './generator';
import { GeneratorArguments } from './generator-arguments';
import { getTypeAsString } from './get-type-as-string';

export class DefinitionsGenerator extends Generator {
  constructor(args: GeneratorArguments) {
    super(args);
  }

  public generate() {
    const { generationPlan } = this.args;

    const sourceFile = this.setupFile('definitions.ts');

    Object.entries(generationPlan.declarations)
      .forEach(([name, plan]) => plan.type === PlanType.INTERFACE
        ? addInterface(sourceFile, plan, name)
        : addArrayTypeAlias(sourceFile, plan, name),
      );
  }
}

function addInterface(sourceFile: SourceFile, plan: InterfacePlan, name: string): void {
  const interfaceDeclaration = sourceFile.addInterface({
    name,
    isExported: true,
  });

  plan.properties.forEach((propPlan: PropertyPlan) => {
    interfaceDeclaration.addProperty({
      name: propPlan.name,
      type: propPlan.type.type === PlanType.REFERENCE ? propPlan.type.to : 'string',
      hasQuestionToken: propPlan.optional,
    });
  });
}

function addArrayTypeAlias(sourceFile: SourceFile, plan: ArrayPlan, name: string): void {
  sourceFile.addTypeAlias({
    name,
    type: `${getTypeAsString(plan.itemType, sourceFile)}[]`,
    isExported: true,
  });
}
