import { IOpenApiObject, IOperationObject, IParameterObject, IPathsObject } from 'open-api.d.ts';
import { InnerGenerateTypescriptOptions } from './types/generate-typescript-options';
import { GenerationPlan, PlanType } from './types/generation-plan';
import { SchemaObject } from './types/schema-object';
import { ArrayType } from './types/ts-extention';
import { schemaObjectToTypePlan } from './utils/schema-object-to-type-plan';
import { resolveReferenceIfNecessary } from './utils/utils';

const operations = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
type Operation = ArrayType<typeof operations>;

export interface ParserArguments {
  schema: IOpenApiObject;
  options: InnerGenerateTypescriptOptions;
}

export class DefaultParser {
  constructor(private readonly args: ParserArguments) {
  }

  public parse(): GenerationPlan {
    const { options, schema } = this.args;

    const declarations: GenerationPlan['declarations'] = {};
    const definitions: Record<string, SchemaObject> = schema.definitions;
    if (definitions) {
      Object.entries(definitions).forEach(([name, schemaObject]) => {
        const typePlan = schemaObjectToTypePlan(schemaObject);
        if (typePlan.type === PlanType.INTERFACE || typePlan.type === PlanType.ARRAY) {
          declarations[name] = typePlan;
        }
      });
    }

    return {
      declarations,
    };
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
}
