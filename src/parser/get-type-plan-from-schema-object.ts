import { IReferenceObject } from 'open-api.d.ts';
import { anyTypePlan, createUnionTypePlanFromStrings } from '../generator/type-plan-utils';
import { PlanType, PropertyPlan, TypePlan } from '../types/generation-plan';
import { JsonSchemaType, ObjectSchemaProperties, SchemaObject } from '../types/schema-object';
import { isReference } from './reference-utils';

const jsonSchemaTypeToTypescriptTypeName: Record<JsonSchemaType, string> = {
  string: 'string',
  integer: 'number',
  number: 'number',
  boolean: 'boolean',
  object: 'object',
  array: 'any[]',
  file: 'File',
};

export function getTypePlanFromSchemaObject(schemaObject: SchemaObject | IReferenceObject): TypePlan {
  if (isReference(schemaObject)) {
    return {
      type: PlanType.REFERENCE,
      to: getTypeNameFromReference(schemaObject),
    };
  }
  switch (schemaObject.type) {
    case JsonSchemaType.STRING:
      if (hasEnum(schemaObject)) {
        return createUnionTypePlanFromStrings(schemaObject.enum);
      }
    case JsonSchemaType.INTEGER:
    case JsonSchemaType.NUMBER:
    case JsonSchemaType.FILE:
    case JsonSchemaType.BOOLEAN:
      return {
        type: PlanType.REFERENCE,
        to: jsonSchemaTypeToTypescriptTypeName[schemaObject.type],
        libType: true,
      };
    case JsonSchemaType.ARRAY:
      return {
        type: PlanType.ARRAY,
        itemType: getTypePlanFromSchemaObject(schemaObject.items),
      };
    case JsonSchemaType.OBJECT:
      return {
        type: PlanType.INTERFACE,
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

function getTypeNameFromReference(reference: IReferenceObject): string {
  const match = /\/([^\/]+)$/.exec(reference.$ref);
  if (!match) {
    throw new Error('Invalid reference');
  }
  return match[1];
}
