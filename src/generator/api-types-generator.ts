import { SourceFile } from 'ts-simple-ast';
import {
  ApiParameterPlan,
  ApiPlan,
  ApiResponsePlan,
  InterfacePlan,
  ParameterType,
  PlanType,
  PropertyPlan,
  TypePlan,
} from '../types/generation-plan';
import { Generator } from './generator';
import { getTypeAsString } from './get-type-as-string';
import { createUnionTypePlanFromStrings, formDataTypePlan, undefinedPlan } from './type-plan-utils';

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
    const imports = this.createImports();
    const initialSourceCode = template.replace('{{imports}}', imports);
    const sourceFile = this.setupFile('api-types.ts', initialSourceCode);
    this.addApiTypesInterface(sourceFile);
  }

  private createImports(): string {
    const definitionImports: string[] = this.getDefinitionReferenceNames();
    return `import { ${definitionImports.join(',\n')} } from './definitions'`;
  }

  private getDefinitionReferenceNames(): string[] {
    return Object.keys(this.args.generationPlan.declarations).sort();
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
        type: {
          type: PlanType.INTERFACE,
          properties: apiPlan.parameters
            .map((parameter) => this.generateParameterProperties(parameter)),
        },
        optional: false,
      },
      {
        name: 'responses',
        type: {
          type: PlanType.INTERFACE,
          properties: [
            {
              name: 'success',
              type: this.getResponseTypePlan(apiPlan.responses, filterSuccessfullResponses),
              optional: false
            },
            {
              name: 'error',
              type: this.getResponseTypePlan(apiPlan.responses, filterUnsuccessfullResponses),
              optional: false
            },
          ],
        },
        optional: false,
      },
    ];
  }

  private getResponseTypePlan(responses: ApiResponsePlan[], filter: (r: ApiResponsePlan) => boolean): TypePlan {
    const filteredResponses = responses.filter(filter);
    if (filteredResponses.length === 0) {
      const defaultResponse = responses.find((r) => r.statusCode === 'default');
      return (defaultResponse && defaultResponse.payloadType) || undefinedPlan;
    }
    return {
      type: PlanType.UNION,
      types: filteredResponses
        .map((r) => r.payloadType || undefinedPlan)
    };
  }

  private generateParameterProperties(parameter: ApiParameterPlan): PropertyPlan {
    let type: TypePlan;
    if (parameter.parameterType === ParameterType.BODY) {
      const firstItem = parameter.items[0];
      type = firstItem.payloadType || undefinedPlan;
    } else {
      type = {
        type: PlanType.INTERFACE,
        properties: parameter.items
          .map(item => ({
              name: item.name,
              type: item.payloadType || undefinedPlan,
              optional: item.optional,
            }),
          ),
      };
      if (parameter.parameterType === ParameterType.FORM_DATA) {
        type = {
          type: PlanType.UNION,
          types: [formDataTypePlan, type],
        };
      }
    }

    return {
      name: parameter.parameterType,
      type,
      optional: false,
    };
  }
}

function filterSuccessfullResponses(response: ApiResponsePlan): boolean {
  return response.statusCode[0] === '2';
}

function filterUnsuccessfullResponses(response: ApiResponsePlan): boolean {
  const firstChar = response.statusCode[0];
  return firstChar !== '2' && response.statusCode !== 'default';
}
