import { OpenAPIObject, ReferenceObject } from 'openapi3-ts';

export function isReference(item: any): item is ReferenceObject {
  return item.$ref != null;
}

export function resolveRef<T>(schema: OpenAPIObject, ref: ReferenceObject): T {
  const { $ref } = ref;
  const match = /^#\/(.*)/.exec($ref);
  if (!match) {
    throw new Error(`Ref "${$ref}" not supported`);
  }
  const keys: string[] = match[1].split('/');
  return keys.reduce((root, property) => {
    if (!(property in root)) {
      const highlightedRef = ref.$ref.replace(RegExp(`\/(${property})`), `/[${property}]`);
      throw new Error(`Couldn't find ref "${highlightedRef}"`);
    }
    return root[property];
  }, schema) as any;
}

export function resolveReferenceIfNecessary<T>(
  schema: OpenAPIObject,
  item: Exclude<T, undefined | null> | ReferenceObject
): T {
  if (isReference(item)) {
    return resolveRef<T>(schema, item);
  }
  return item;
}
