import { IOpenApiObject, IOperationObject, IParameterObject, IPathsObject, IResponseObject } from 'open-api.d.ts';
import {
  ApiParameterMappingPlan,
  ApiParameterPlan,
  ApiResponseMappingPlan,
  ApiResponsePlan,
  GenerationPlan,
  InterfacePlan,
  ParameterType,
  PropertyPlan,
  TypePlan,
  TypePlanType
} from '../type-plans';
import { formDataTypePlan, undefinedPlan } from '../type-plans/utils';
import { InnerGenerateTypescriptOptions } from '../types/generate-typescript-options';
import { Parser } from '../types/parser';
import { SchemaObject } from '../types/schema-object';
import { ArrayType } from '../types/ts-extentions';
import { getTypePlanFromSchemaObject, resolveReferenceIfNecessary } from './utils';

const operations = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
type Operation = ArrayType<typeof operations>;

export interface ParserArguments {
  schema: IOpenApiObject;
  options: InnerGenerateTypescriptOptions;
}

export class DefaultParser extends Parser {
  constructor(args: ParserArguments) {
    super(args);
  }

  public parse(): GenerationPlan {

    return {
      definitions: this.createDeclarationPlans(),
      api: this.createApiPlans(),
    };
  }

  private createDeclarationPlans(): GenerationPlan['definitions'] {
    const { schema } = this.args;

    const declarations: GenerationPlan['definitions'] = {};
    const definitions: Record<string, SchemaObject> = schema.definitions;
    if (definitions) {
      Object.entries(definitions).forEach(([name, schemaObject]) => {
        const typePlan = getTypePlanFromSchemaObject(schemaObject);
        if (typePlan.type === TypePlanType.INTERFACE || typePlan.type === TypePlanType.ARRAY) {
          declarations[name] = typePlan;
        }
      });
    }
    return declarations;
  }

  private createApiPlans(): GenerationPlan['api'] {
    const apiPlans: GenerationPlan['api'] = {};

    this.mapPaths((path, pathObject) => {
      this.mapOperations(pathObject, (operation, operationObject) => {
        if (!operationObject.operationId) {
          throw new Error(`Operation Id for "${path} ${operation}" is missing. Parsing not possible.`);
        }

        apiPlans[operationObject.operationId] = {
          operationId: operationObject.operationId,
          docs: operationObject.summary,
          tags: operationObject.tags || [],
          url: path,
          method: operation,
          responses: this.createApiResponseMapping(operationObject),
          parameters: this.createApiParameterMapping(pathObject, operationObject),
        };
      });
    });

    return apiPlans;
  }

  private mapPaths<T>(map: (pathAndExtension: string, pathObject: IPathsObject) => T): T[] {
    const { schema } = this.args;
    return Object.entries(schema.paths)
      .map(([pathAndExtension, pathObject]) =>
        map(pathAndExtension, resolveReferenceIfNecessary(schema, pathObject)),
      );
  }

  private mapOperations<T>(
    pathObject: IPathsObject,
    forEach: (operation: Operation, operationObject: IOperationObject) => T,
  ): T[] {
    return operations
      .filter(operation => operation in pathObject)
      .map(operation => [operation, pathObject[operation]])
      .map(([operation, operationObject]) => forEach(operation, operationObject));
  }

  private createApiResponseMapping(operationObject: IOperationObject): ApiResponseMappingPlan {
    const responsePlansByStatusCode = this.createApiResponsePlansByStatusCode(operationObject);
    return {
      success: this.getAggregatedResponseTypePlan(responsePlansByStatusCode, filterSuccessfulResponses),
      error: this.getAggregatedResponseTypePlan(responsePlansByStatusCode, filterUnsuccessfulResponses),
      byStatusCode: responsePlansByStatusCode,
    };
  }

  private getAggregatedResponseTypePlan(
    responses: ApiResponsePlan[],
    filter: (r: ApiResponsePlan) => boolean
  ): TypePlan {
    const filteredResponses = responses.filter(filter);
    if (filteredResponses.length === 0) {
      const defaultResponse = responses.find((r) => r.statusCode === 'default');
      return (defaultResponse && defaultResponse.payloadType) || undefinedPlan;
    }
    return {
      type: TypePlanType.UNION,
      types: filteredResponses
        .map((r) => r.payloadType || undefinedPlan)
    };
  }

  private createApiResponsePlansByStatusCode(operationObject: IOperationObject): ApiResponsePlan[] {
    return this.mapResponses(operationObject, (statusCode, responseObject) => {
      let schema = (responseObject as any).schema;
      if (!schema && (responseObject as any).type) {
        schema = { type: (responseObject as any).type };
      }
      return {
        statusCode,
        payloadType: schema ? getTypePlanFromSchemaObject(schema) : undefined,
      };
    });
  }

  private createApiParameterMapping(
    pathObject: IPathsObject,
    operationObject: IOperationObject
  ): ApiParameterMappingPlan {
    const allPlans = this.createApiParameterPlans(pathObject, operationObject);
    const parameterType: InterfacePlan = {
      type: TypePlanType.INTERFACE,
      properties: allPlans.map(parameter => this.createApiParameterPropertyPlan(parameter))
    };
    return {
      byParameterType: allPlans,
      type: parameterType,
    };
  }

  private createApiParameterPlans(pathObject: IPathsObject, operationObject: IOperationObject): ApiParameterPlan[] {
    const groupedParameters: Partial<Record<ParameterType, IParameterObject[]>> = {};
    this.mapParameters(pathObject, operationObject, (parameterObject) => {
      const parameterType = parameterObject.in as ParameterType;
      groupedParameters[parameterType] = [
        ...(groupedParameters[parameterType] || []),
        parameterObject,
      ];
    });
    return Object.entries(groupedParameters)
      .map(([parameterType, values]) => {
        return {
          parameterType: parameterType as ParameterType,
          items: values!.map((parameterObject) => {
            const items = (parameterObject as any).items;
            let schema = (parameterObject as any).schema;
            if (!schema && (parameterObject as any).type) {
              schema = { type: (parameterObject as any).type };
            }
            let payloadType: TypePlan | undefined;
            if (items) {
              payloadType = {
                type: TypePlanType.ARRAY,
                itemType: getTypePlanFromSchemaObject(items),
              };
            } else if (schema) {
              payloadType = getTypePlanFromSchemaObject(schema);
            }

            return {
              payloadType,
              name: parameterObject.name,
              optional: parameterObject.required === false,
            };
          }),
        };
      });
  }

  private createApiParameterPropertyPlan(parameter: ApiParameterPlan): PropertyPlan {
    let type: TypePlan;
    if (parameter.parameterType === ParameterType.BODY) {
      const firstItem = parameter.items[0];
      type = firstItem.payloadType || undefinedPlan;
    } else {
      type = {
        type: TypePlanType.INTERFACE,
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
          type: TypePlanType.UNION,
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

  private mapParameters<T>(
    pathObject: IPathsObject,
    operationObject: IOperationObject,
    forEach: (parameterObject: IParameterObject) => T,
  ): T[] {
    const parameters = [
      ...(pathObject.paramters || []),
      ...(operationObject.parameters || []),
    ];
    return parameters
      .map((parameterOrReference) => resolveReferenceIfNecessary(this.args.schema, parameterOrReference))
      .map(parameter => forEach(parameter));
  }

  private mapResponses<T>(
    operationObject: IOperationObject,
    forEach: (responseCode: string, responseObject: IResponseObject) => T,
  ): T[] {
    return Object.entries(operationObject.responses)
      .map(([code, responseOrReference]) => [code, resolveReferenceIfNecessary(this.args.schema, responseOrReference)])
      .map(([code, response]) => forEach(code, response));
  }
}

function filterSuccessfulResponses(response: ApiResponsePlan): boolean {
  return response.statusCode[0] === '2';
}

function filterUnsuccessfulResponses(response: ApiResponsePlan): boolean {
  const firstChar = response.statusCode[0];
  return firstChar !== '2' && response.statusCode !== 'default';
}
