import { OpenAPIObject, ReferenceObject } from 'openapi3-ts';
import { isReference, resolveRef, resolveReferenceIfNecessary } from './reference-utils';

describe('isReference', () => {
  it('should check if an object is an reference', () => {
    expect(isReference({ $ref: '#/test' })).toBe(true);
    expect(isReference({ notRef: '#/test' })).toBe(false);
  });
});

describe('resolveRef', () => {
  it('should resolve a reference', () => {
    const expectedResult = {
      a: 1,
    };
    const mockSchema: Partial<OpenAPIObject> = {
      definitions: {
        Test: expectedResult,
      },
    };
    const reference: ReferenceObject = {
      $ref: '#/definitions/Test',
    };

    expect(resolveRef(mockSchema as any, reference)).toBe(expectedResult);
  });

  it('should throw an error on reference in another file', () => {
    const mockSchema: Partial<OpenAPIObject> = {
      definitions: {},
    };
    const reference: ReferenceObject = {
      $ref: 'otherFile/#/definitions/Test',
    };

    expect(() => resolveRef(mockSchema as any, reference)).toThrowErrorMatchingSnapshot();
  });

  it('should throw an error if reference is invalid', () => {
    const mockSchema: Partial<OpenAPIObject> = {
      definitions: {},
    };
    const reference: ReferenceObject = {
      $ref: '#/definitions/Test',
    };

    expect(() => resolveRef(mockSchema as any, reference)).toThrowErrorMatchingSnapshot();
  });
});

describe('resolveReferenceIfNecessary', () => {
  it('should resolve a reference if the given object is a reference', () => {
    const expectedResult = { a: 1 };
    const mockSchema: Partial<OpenAPIObject> = {
      definitions: {
        Test: expectedResult,
      },
    };
    const reference: ReferenceObject = {
      $ref: '#/definitions/Test',
    };

    expect(resolveReferenceIfNecessary(mockSchema as any, reference)).toBe(expectedResult);
  });

  it('should just return the object if it is not a reference', () => {
    const expectedResult = { a: 1 };
    const mockSchema: Partial<OpenAPIObject> = {};

    expect(resolveReferenceIfNecessary(mockSchema as any, expectedResult)).toBe(expectedResult);
  });
});
