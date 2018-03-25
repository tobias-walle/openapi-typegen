import { SourceFile } from 'ts-simple-ast';
import { ApiPlan, InterfacePlan, PlanType, PropertyPlan, } from '../types/generation-plan';
import { Generator } from './generator';
import { getDefinitionsImport } from './get-definitions-import';
import { getTypeAsString } from './get-type-as-string';
import { createUnionTypePlanFromStrings } from './type-plan-utils';

const template = `
{{imports}}

export enum ParameterType {
    BODY = 'body',
    QUERY = 'query',
    FORM_DATA = 'formData',
    PATH = 'path',
}

export type ApiOperationIds = keyof ApiTypes;
`.trim();

export class ApiTypesGenerator extends Generator {
  public generate() {
    const imports = getDefinitionsImport(this.args.generationPlan.definitions);
    const initialSourceCode = template.replace('{{imports}}', imports);
    const sourceFile = this.setupFile('api-types.ts', initialSourceCode);
    this.addApiTypesInterface(sourceFile);
  }

  private addApiTypesInterface(sourceFile: SourceFile): void {
    const { generationPlan } = this.args;

    const apiTypesInterface = sourceFile.addInterface({ name: 'ApiTypes', isExported: true });
    Object.values(generationPlan.api)
      .forEach((apiPlan) => {
        const apiTypeInterface: InterfacePlan = {
          type: PlanType.INTERFACE,
          properties: this.generateApiTypeInterfacePlanProperties(apiPlan),
        };

        apiTypesInterface.addProperty({
          name: apiPlan.operationId,
          type: getTypeAsString(apiTypeInterface, sourceFile),
        });
      });
  }

  private generateApiTypeInterfacePlanProperties(apiPlan: ApiPlan): PropertyPlan[] {
    return [
      {
        name: 'tag', type: createUnionTypePlanFromStrings(apiPlan.tags), optional: false,
      },
      {
        name: 'parameters',
        type: apiPlan.parameters.type,
        optional: false,
      },
      {
        name: 'responses',
        type: {
          type: PlanType.INTERFACE,
          properties: [
            {
              name: 'success',
              type: apiPlan.responses.success,
              optional: false
            },
            {
              name: 'error',
              type: apiPlan.responses.error,
              optional: false
            },
          ],
        },
        optional: false,
      },
    ];
  }
}
