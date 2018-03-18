import { IReferenceObject } from 'open-api.d.ts';
import { PlanType, PropertyPlan, TypePlan } from '../types/generation-plan';
import { JsonSchemaType, ObjectSchemaProperties, SchemaObject } from '../types/schema-object';
import { isReference } from './utils';

const jsonSchemaTypeToTypescriptTypeName: Record<JsonSchemaType, string> = {
  string: 'string',
  integer: 'number',
  number: 'number',
  boolean: 'boolean',
  object: 'object',
  array: 'any[]',
};

export function schemaObjectToTypePlan(schemaObject: SchemaObject | IReferenceObject): TypePlan {
  if (isReference(schemaObject)) {
    return {
      type: PlanType.REFERENCE,
      to: getTypeNameFromReference(schemaObject),
    };
  }
  switch (schemaObject.type) {
    case JsonSchemaType.STRING:
    case JsonSchemaType.INTEGER:
    case JsonSchemaType.NUMBER:
    case JsonSchemaType.BOOLEAN:
      return {
        type: PlanType.REFERENCE,
        to: jsonSchemaTypeToTypescriptTypeName[schemaObject.type],
      };
    case JsonSchemaType.ARRAY:
      return {
        type: PlanType.ARRAY,
        itemType: schemaObjectToTypePlan(schemaObject.items),
      };
    case JsonSchemaType.OBJECT:
    default:
      return {
        type: PlanType.INTERFACE,
        properties: objectSchemaPropertiesToPropertyPlans(schemaObject.properties, schemaObject.required),
      };
  }
}

function objectSchemaPropertiesToPropertyPlans(
  properties: ObjectSchemaProperties | undefined,
  requiredProperties: string[] = [],
): PropertyPlan[] {
  return properties
    ? Object.entries(properties).map(([propertyName, property]) => ({
      name: propertyName,
      type: schemaObjectToTypePlan(property),
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