import { SourceFile, SyntaxKind } from 'ts-simple-ast';
import { PlanType, PropertyPlan, TypePlan } from '../types/generation-plan';

const INDENT_SIZE = 4;

export function getTypeAsString(typePlan: TypePlan, sourceFile: SourceFile, interfaceIndent = INDENT_SIZE): string {
  switch (typePlan.type) {
    case PlanType.ARRAY:
      return `${getTypeAsString(typePlan.itemType, sourceFile)}[]`;
    case PlanType.INTERFACE:
      const temporaryInterface = sourceFile.addInterface({
        name: 'Inline',
      });
      typePlan.properties.forEach((propPlan: PropertyPlan) => {
        temporaryInterface.addProperty({
          name: propPlan.name,
          type: getTypeAsString(propPlan.type, sourceFile, interfaceIndent + INDENT_SIZE),
          hasQuestionToken: propPlan.optional,
        });
      });
      const syntaxList = temporaryInterface.getChildrenOfKind(SyntaxKind.SyntaxList)[0];
      let typeName = '{]';
      if (syntaxList) {
        const properties = syntaxList.getChildrenOfKind(SyntaxKind.PropertySignature).map(p => p.getText());
        const formattedProperties = properties.map(p => indentString(p, interfaceIndent)).join('\n');
        typeName = `{\n${formattedProperties}\n${indentString('}', interfaceIndent - INDENT_SIZE)}`;
      }
      temporaryInterface.remove();
      return typeName;
    case PlanType.REFERENCE:
      return typePlan.to;
  }
}

function indentString(str: string, indent: number): string {
  let result = str;
  for (let i = 0; i < indent; i++) {
    result = ' ' + result;
  }
  return result;
}
