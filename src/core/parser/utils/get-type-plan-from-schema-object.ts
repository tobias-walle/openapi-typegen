import { ReferenceObject, SchemaObject } from 'openapi3-ts';
import { PropertyPlan, TypePlan, TypePlanType } from '../../type-plans';
import { anyTypePlan, createUnionTypePlanFromStrings } from '../../type-plans/utils';
import { JsonSchemaType, ObjectSchemaProperties, UnionSchemaObject } from '../../types/union-schema-object';
import { isReference } from './reference-utils';

const jsonSchemaTypeToTypescriptTypeName: Record<JsonSchemaType, string> = {
  string: 'string',
  integer: 'number',
  number: 'number',
  boolean: 'boolean',
  object: 'object',
  array: 'any[]',
};

export function getTypePlanFromSchemaObject(schemaOrReference: SchemaObject | ReferenceObject): TypePlan {
  if (isReference(schemaOrReference)) {
    return {
      type: TypePlanType.REFERENCE,
      to: getTypeNameFromReference(schemaOrReference),
    };
  }
  const schemaObject = schemaOrReference as UnionSchemaObject;
  switch (schemaObject.type) {
    case JsonSchemaType.STRING:
      if (schemaObject.format === 'binary') {
        return {
          type: TypePlanType.REFERENCE,
          to: 'File',
          libType: true
        };
      }
      if (hasEnum(schemaObject)) {
        return createUnionTypePlanFromStrings(schemaObject.enum);
      }
    case JsonSchemaType.INTEGER:
    case JsonSchemaType.NUMBER:
    case JsonSchemaType.BOOLEAN:
      return {
        type: TypePlanType.REFERENCE,
        to: jsonSchemaTypeToTypescriptTypeName[schemaObject.type],
        libType: true,
      };
    case JsonSchemaType.ARRAY:
      return {
        type: TypePlanType.ARRAY,
        itemType: getTypePlanFromSchemaObject(schemaObject.items),
      };
    case JsonSchemaType.OBJECT:
      return {
        type: TypePlanType.INTERFACE,
        properties: getPropertyPlansFromObjectSchemaProperties(schemaObject.properties, schemaObject.required),
      };
    default:
      console.warn(`Unknown schema type "${(schemaObject as any).type}". Returning any.`);
      return anyTypePlan;
  }
}

interface WithEnum {
  enum: string[];
}

function hasEnum(schema: any): schema is WithEnum {
  return 'enum' in schema;
}

function getPropertyPlansFromObjectSchemaProperties(
  properties: ObjectSchemaProperties | undefined,
  requiredProperties: string[] = [],
): PropertyPlan[] {
  return properties
    ? Object.entries(properties).map(([propertyName, property]) => ({
      name: propertyName,
      type: getTypePlanFromSchemaObject(property),
      optional: !requiredProperties.includes(propertyName),
    }))
    : [];
}

function getTypeNameFromReference(reference: ReferenceObject): string {
  const match = /\/([^\/]+)$/.exec(reference.$ref);
  if (!match) {
    throw new Error('Invalid reference');
  }
  return match[1];
}
