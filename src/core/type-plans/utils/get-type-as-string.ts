import { SourceFile, SyntaxKind } from 'ts-simple-ast';
import { PropertyPlan, TypePlanType } from '../index';
import { TypePlan } from '../types';

export function getTypeAsString(typePlan: TypePlan, sourceFile: SourceFile): string {
  switch (typePlan.type) {
    case TypePlanType.ARRAY:
      const itemTypeAsString = getTypeAsString(typePlan.itemType, sourceFile);
      if (typePlan.itemType.type === TypePlanType.UNION) {
        return `Array<${itemTypeAsString}>`;
      } else {
        return `${itemTypeAsString}[]`;
      }
    case TypePlanType.INTERFACE:
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
    case TypePlanType.REFERENCE:
      if (typePlan.generics && typePlan.generics.length > 0) {
        return `${typePlan.to}<${typePlan.generics.map((type) => getTypeAsString(type, sourceFile))}>`;
      } else {
        return typePlan.to;
      }
    case TypePlanType.UNION:
      return [...new Set(typePlan.types)].map(t => getTypeAsString(t, sourceFile)).join('|');
    case TypePlanType.FUNCTION:
      const parameters = typePlan.arguments
        .map(({name, type}) => `${name}: ${getTypeAsString(type, sourceFile)}`)
        .join(', ');
      const returnType = getTypeAsString(typePlan.returnType, sourceFile);
      return `(${parameters}) => ${returnType}`;
  }
}
