import { SourceFile } from 'ts-simple-ast';
import {
  ApiParameterPlan,
  ApiPlan,
  InterfacePlan,
  ParameterType,
  PlanType,
  PropertyPlan,
  ReferencePlan,
  TypePlan,
} from '../types/generation-plan';
import { Generator } from './generator';
import { getTypeAsString } from './get-type-as-string';
import { createUnionTypePlanFromStrings, formDataTypePlan } from './type-plan-utils';

const initialSourceCode = `
export enum ParameterType {
    BODY = 'body',
    QUERY = 'query',
    FORM_DATA = 'formData',
    PATH = 'path',
}

export type ApiOperationIds = keyof ApiTypes;
`.trim();

const neverPlan: ReferencePlan = {
  type: PlanType.REFERENCE,
  to: 'never',
  libType: true,
};

export class ApiTypesGenerator extends Generator {
  public generate() {
    const sourceFile = this.setupFile('api-types.ts', initialSourceCode);
    this.addImports(sourceFile);
    this.addApiTypesInterface(sourceFile);
  }

  private addImports(sourceFile: SourceFile): void {
    const definitionImports: string[] = this.getDefinitionReferenceNames();
    sourceFile.addImportDeclaration({
      namedImports: definitionImports,
      moduleSpecifier: './definitions',
    });
  }

  private getDefinitionReferenceNames(): string[] {
    const result: Set<string> = new Set<string>();
    Object.values(this.args.generationPlan.api)
      .forEach((apiPlan) => {
        apiPlan.parameters.forEach((parameter) => {
          parameter.items.forEach((item) => {
            if (item.payloadType && item.payloadType.type === PlanType.REFERENCE && !item.payloadType.libType) {
              result.add(item.payloadType.to);
            }
          });
        });
        apiPlan.responses.forEach((response) => {
          if (
            response.payloadType
            && response.payloadType.type === PlanType.REFERENCE
            && !response.payloadType.libType
          ) {
            result.add(response.payloadType.to);
          }
        });
      });
    return Array.from(result).sort();
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
          properties: apiPlan.responses.map((response) => ({
            name: response.statusCode,
            type: response.payloadType || neverPlan,
            optional: false,
          })),
        },
        optional: false,
      },
    ];
  }

  private generateParameterProperties(parameter: ApiParameterPlan): PropertyPlan {
    let type: TypePlan;
    if (parameter.parameterType === ParameterType.BODY) {
      const firstItem = parameter.items[0];
      type = firstItem.payloadType || neverPlan;
    } else {
      type = {
        type: PlanType.INTERFACE,
        properties: parameter.items
          .map(item => ({
              name: item.name,
              type: item.payloadType || neverPlan,
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
