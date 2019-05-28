import {
  OpenAPIObject,
  OperationObject,
  ParameterObject,
  PathsObject,
  ResponseObject,
  SchemaObject
} from 'openapi3-ts';
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
import { anyTypePlan, formDataTypePlan, undefinedPlan } from '../type-plans/utils';
import { InnerGenerateTypescriptOptions } from '../types/generate-typescript-options';
import { Parser } from '../types/parser';
import { ArrayType } from '../types/ts-extentions';
import { getTypePlanFromSchemaObject, resolveReferenceIfNecessary } from './utils';

const operations = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
type Operation = ArrayType<typeof operations>;

export interface ParserArguments {
  schema: OpenAPIObject;
  options: InnerGenerateTypescriptOptions;
}

export class DefaultParser extends Parser {
  constructor(args: ParserArguments) {
    super(args);
  }

  public parse(): GenerationPlan {
    const firstServer = this.args.schema.servers && this.args.schema.servers[0];
    return {
      definitions: this.createDeclarationPlans(),
      api: this.createApiPlans(),
      meta: {
        baseUrl: firstServer && firstServer.url
      }
    };
  }

  private createDeclarationPlans(): GenerationPlan['definitions'] {
    const { schema } = this.args;

    const declarations: GenerationPlan['definitions'] = {};
    const definitions: SchemaObject = resolveReferenceIfNecessary(schema, (schema.components || {}).schemas || {});
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

  private mapPaths<T>(map: (pathAndExtension: string, pathObject: PathsObject) => T): T[] {
    const { schema } = this.args;
    return Object.entries(schema.paths)
      .map(([pathAndExtension, pathObject]) =>
        map(pathAndExtension, resolveReferenceIfNecessary(schema, pathObject)),
      );
  }

  private mapOperations<T>(
    pathObject: PathsObject,
    forEach: (operation: Operation, operationObject: OperationObject) => T,
  ): T[] {
    return operations
      .filter(operation => operation in pathObject)
      .map(operation => [operation, pathObject[operation]])
      .map(([operation, operationObject]) => forEach(operation, operationObject));
  }

  private createApiResponseMapping(operationObject: OperationObject): ApiResponseMappingPlan {
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

  private createApiResponsePlansByStatusCode(operationObject: OperationObject): ApiResponsePlan[] {
    return this.mapResponses(operationObject, (statusCode, responseObject) => {
      const content = responseObject.content && Object.values(responseObject.content)[0];
      const schema = content && content.schema;
      return {
        statusCode,
        payloadType: schema ? getTypePlanFromSchemaObject(schema) : undefined,
      };
    });
  }

  private createApiParameterMapping(
    pathObject: PathsObject,
    operationObject: OperationObject
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

  private createApiParameterPlans(pathObject: PathsObject, operationObject: OperationObject): ApiParameterPlan[] {
    const bodyParameters = this.createApiParameterPlansFromRequestBody(operationObject);
    const groupedParameters: Partial<Record<ParameterType, ParameterObject[]>> = {};
    this.mapParameters(pathObject, operationObject, (parameterObject) => {
      const parameterType = parameterObject.in as ParameterType;
      groupedParameters[parameterType] = [
        ...(groupedParameters[parameterType] || []),
        parameterObject,
      ];
    });
    const otherParamters = Object.entries(groupedParameters)
      .map(([parameterType, values]) => {
        return {
          parameterType: parameterType as ParameterType,
          items: values!.map((parameterObject) => {
            const items = parameterObject.items;
            let schema = parameterObject.schema;
            if (!schema && parameterObject.type) {
              schema = { type: parameterObject.type };
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

    return [...bodyParameters, ...otherParamters];
  }

  private createApiParameterPropertyPlan(parameter: ApiParameterPlan): PropertyPlan {
    let type: TypePlan;
    if ([ParameterType.BODY, ParameterType.FORM_DATA].includes(parameter.parameterType)) {
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
    }

    if (parameter.parameterType === ParameterType.FORM_DATA) {
      type = {
        type: TypePlanType.UNION,
        types: [formDataTypePlan, type],
      };
    }

    return {
      name: parameter.parameterType,
      type,
      optional: false,
    };
  }

  private mapParameters<T>(
    pathObject: PathsObject,
    operationObject: OperationObject,
    forEach: (parameterObject: ParameterObject) => T,
  ): T[] {
    const parameters = [
      ...(pathObject.parameters || []),
      ...(operationObject.parameters || []),
    ];
    return parameters
      .map(
        (parameterOrReference) => resolveReferenceIfNecessary<ParameterObject>(this.args.schema, parameterOrReference)
      )
      .map(parameter => forEach(parameter));
  }

  private createApiParameterPlansFromRequestBody(operationObject: OperationObject): ApiParameterPlan[] {
    const { schema } = this.args;
    if (!operationObject.requestBody) {
      return [];
    }
    const body = resolveReferenceIfNecessary(schema, operationObject.requestBody);
    let payloadType: TypePlan = anyTypePlan;

    const contentTypeMapping: Record<string, { type: ParameterType, name: string }> = {
      'application/json': { type: ParameterType.BODY, name: 'body' },
      'application/x-www-form-urlencoded': { type: ParameterType.FORM_DATA, name: 'form' },
      'multipart/form-data': { type: ParameterType.FORM_DATA, name: 'form' }
    };

    return Object.entries(body.content)
      .filter(([contentType]) => contentTypeMapping[contentType] != null)
      .map(([contentType, media]) => {
        const { name, type } = contentTypeMapping[contentType];
        payloadType = media.schema ? getTypePlanFromSchemaObject(media.schema) : anyTypePlan;
        return {
          parameterType: type,
          items: [
            {
              name,
              optional: body.required || false,
              payloadType
            }
          ]
        };
      });
  }

  private mapResponses<T>(
    operationObject: OperationObject,
    forEach: (responseCode: string, responseObject: ResponseObject) => T,
  ): T[] {
    return Object.entries(operationObject.responses)
      .map(([code, responseOrReference]) => [
        code,
        resolveReferenceIfNecessary<ResponseObject>(this.args.schema, responseOrReference)
      ] as const)
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
