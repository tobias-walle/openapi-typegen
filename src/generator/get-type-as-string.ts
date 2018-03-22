import { SourceFile, SyntaxKind } from 'ts-simple-ast';
import { PlanType, PropertyPlan, TypePlan } from '../types/generation-plan';

export function getTypeAsString(typePlan: TypePlan, sourceFile: SourceFile): string {
  switch (typePlan.type) {
    case PlanType.ARRAY:
      const itemTypeAsString = getTypeAsString(typePlan.itemType, sourceFile);
      if (typePlan.itemType.type === PlanType.UNION) {
        return `Array<${itemTypeAsString}>`;
      } else {
        return `${itemTypeAsString}[]`;
      }
    case PlanType.INTERFACE:
      const temporaryInterface = sourceFile.addInterface({
        name: 'Inline',
      });
      typePlan.properties.forEach((propPlan: PropertyPlan) => {
        temporaryInterface.addProperty({
          name: propPlan.name,
          type: getTypeAsString(propPlan.type, sourceFile),
          hasQuestionToken: propPlan.optional,
        });
      });
      const syntaxList = temporaryInterface.getChildrenOfKind(SyntaxKind.SyntaxList)[0];
      let typeName = '{}';
      if (syntaxList) {
        const properties = syntaxList.getChildrenOfKind(SyntaxKind.PropertySignature).map(p => p.getText());
        if (properties.length > 0) {
          typeName = `{\n${properties.join('\n')}\n}`;
        }
      }
      temporaryInterface.remove();
      return typeName;
    case PlanType.REFERENCE:
      return typePlan.to;
    case PlanType.UNION:
      return typePlan.types.map(t => getTypeAsString(t, sourceFile)).join('|');
  }
}
