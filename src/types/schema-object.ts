import { IReferenceObject } from 'open-api.d.ts';

export enum JsonSchemaType {
  STRING = 'string',
  INTEGER = 'integer',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array',
}

export type ObjectSchemaProperties =  Record<string, SchemaObject | IReferenceObject>;

export interface ObjectSchemaObject {
  type: JsonSchemaType.OBJECT;
  required?: string[];
  properties?: ObjectSchemaProperties;
}

export interface StringSchemaObject {
  type: JsonSchemaType.STRING;
  format?: string;
}

export interface ArraySchemaObject {
  type: JsonSchemaType.ARRAY;
  items: IReferenceObject | ObjectSchemaObject;
}

export interface IntegerSchemaObject {
  type: JsonSchemaType.INTEGER;
}

export interface NumberSchemaObject {
  type: JsonSchemaType.NUMBER;
}

export interface BooleanSchemaObject {
  type: JsonSchemaType.BOOLEAN;
}

export type SchemaObject =
  ObjectSchemaObject
  | StringSchemaObject
  | ArraySchemaObject
  | IntegerSchemaObject
  | NumberSchemaObject
  | BooleanSchemaObject;
