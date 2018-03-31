import { SourceFile } from 'ts-simple-ast';
import { InterfacePlan, PropertyPlan } from '../../type-plans';
import { getTypeAsString } from '../../type-plans/utils';

export function addInterface(sourceFile: SourceFile, plan: InterfacePlan, name: string): void {
  const interfaceDeclaration = sourceFile.addInterface({
    name,
    isExported: true,
  });

  plan.properties.forEach((propPlan: PropertyPlan) => {
    interfaceDeclaration.addProperty({
      name: propPlan.name,
      type: getTypeAsString(propPlan.type, sourceFile),
      hasQuestionToken: propPlan.optional,
    });
  });
}
