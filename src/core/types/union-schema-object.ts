import { ReferenceObject } from 'openapi3-ts';

export enum JsonSchemaType {
  STRING = 'string',
  INTEGER = 'integer',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array',
}

export type ObjectSchemaProperties =  Record<string, UnionSchemaObject | ReferenceObject>;

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
  items: ReferenceObject | ObjectSchemaObject;
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

export type UnionSchemaObject =
  ObjectSchemaObject
  | StringSchemaObject
  | ArraySchemaObject
  | IntegerSchemaObject
  | NumberSchemaObject
  | BooleanSchemaObject;
