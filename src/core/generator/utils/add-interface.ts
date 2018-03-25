import { SourceFile } from 'ts-simple-ast';
import { InterfacePlan, PropertyPlan, TypePlanType } from '../../type-plans';

export function addInterface(sourceFile: SourceFile, plan: InterfacePlan, name: string): void {
  const interfaceDeclaration = sourceFile.addInterface({
    name,
    isExported: true,
  });

  plan.properties.forEach((propPlan: PropertyPlan) => {
    interfaceDeclaration.addProperty({
      name: propPlan.name,
      type: propPlan.type.type === TypePlanType.REFERENCE ? propPlan.type.to : 'string',
      hasQuestionToken: propPlan.optional,
    });
  });
}
