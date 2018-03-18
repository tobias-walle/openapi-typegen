import { Block, InterfaceDeclaration, SyntaxKind } from 'ts-simple-ast';
import { PlanType, PropertyPlan, TypePlan } from '../types/generation-plan';

export function getTypeAsString(typePlan: TypePlan): string {
  switch (typePlan.type) {
    case PlanType.ARRAY:
      return `${getTypeAsString(typePlan)}[]`;
    case PlanType.INTERFACE:
      const interfaceDeclaration = new InterfaceDeclaration();
      typePlan.properties.forEach((propPlan: PropertyPlan) => {
        interfaceDeclaration.addProperty({
          name: propPlan.name,
          type: getTypeAsString(propPlan.type),
          hasQuestionToken: propPlan.optional,
        });
      });
      const block: Block = interfaceDeclaration.getChildAtIndexIfKind(0, SyntaxKind.Block)!!;
      return block.getText();
    case PlanType.REFERENCE:
      return typePlan.to;
  }
}
