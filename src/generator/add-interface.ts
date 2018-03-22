import { SourceFile } from 'ts-simple-ast';
import { InterfacePlan, PlanType, PropertyPlan } from '../types/generation-plan';

export function addInterface(sourceFile: SourceFile, plan: InterfacePlan, name: string): void {
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
