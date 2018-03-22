import { IOpenApiObject, IOperationObject, IParameterObject, IPathsObject, IResponseObject } from 'open-api.d.ts';
import { InnerGenerateTypescriptOptions } from '../types/generate-typescript-options';
import {
  ApiParameterPlan,
  ApiResponsePlan,
  GenerationPlan,
  ParameterType,
  PlanType,
  TypePlan,
} from '../types/generation-plan';
import { SchemaObject } from '../types/schema-object';
import { ArrayType } from '../types/ts-extentions';
import { getTypePlanFromSchemaObject } from './get-type-plan-from-schema-object';
import { Parser } from './parser';
import { resolveReferenceIfNecessary } from './reference-utils';

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
      declarations: this.createDeclarationPlans(),
      api: this.createApiPlans(),
    };
  }

  private createDeclarationPlans(): GenerationPlan['declarations'] {
    const { schema } = this.args;

    const declarations: GenerationPlan['declarations'] = {};
    const definitions: Record<string, SchemaObject> = schema.definitions;
    if (definitions) {
      Object.entries(definitions).forEach(([name, schemaObject]) => {
        const typePlan = getTypePlanFromSchemaObject(schemaObject);
        if (typePlan.type === PlanType.INTERFACE || typePlan.type === PlanType.ARRAY) {
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
          tags: operationObject.tags || [],
          url: path,
          method: operation,
          responses: this.createApiResponsePlans(operationObject),
          parameters: this.createApiParameterPlans(pathObject, operationObject),
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

  private createApiResponsePlans(operationObject: IOperationObject): ApiResponsePlan[] {
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
                type: PlanType.ARRAY,
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
