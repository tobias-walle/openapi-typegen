import { IOpenApiObject, IReferenceObject } from 'open-api.d.ts';

export function isReference(item: any): item is IReferenceObject {
  return item.$ref != null;
}

export function resolveRef<T>(schema: IOpenApiObject, ref: IReferenceObject): T {
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
  }, schema);
}

export function resolveReferenceIfNecessary<T>(schema: IOpenApiObject, item: T | IReferenceObject): T {
  if (isReference(item)) {
    return resolveRef<T>(schema, item);
  }
  return item;
}

export function flatten<T>(array: T[], otherArray: T[]): T[] {
  return [
    ...array,
    ...otherArray,
  ];
}
