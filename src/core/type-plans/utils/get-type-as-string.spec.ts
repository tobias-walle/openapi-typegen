import { Project, SourceFile } from 'ts-morph';
import { ArrayPlan, InterfacePlan, ReferencePlan, TypePlanType } from '../types';
import { getTypeAsString } from './get-type-as-string';

describe('getTypeAsString', () => {
  let sourceFile: SourceFile;

  beforeEach(() => {
    sourceFile = new Project({ useVirtualFileSystem: true }).createSourceFile('temp.ts');
  });

  afterEach(() => {
    expect(sourceFile.getInterfaces().length).toBe(0);
  });

  it('should get array as string', () => {
    const stringPlan: ReferencePlan = {
      type: TypePlanType.REFERENCE,
      to: 'string',
      libType: true,
    };
    const arrayPlan: ArrayPlan = {
      type: TypePlanType.ARRAY,
      itemType: stringPlan,
    };

    expect(getTypeAsString(arrayPlan, sourceFile)).toBe('string[]');
  });

  it('should get interface as string', () => {
    const stringPlan: ReferencePlan = {
      type: TypePlanType.REFERENCE,
      to: 'string',
      libType: true,
    };
    const childInterfacePlan: InterfacePlan = {
      type: TypePlanType.INTERFACE,
      properties: [
        { type: stringPlan, name: 'name', optional: true },
      ],
    };
    const interfacePlan: InterfacePlan = {
      type: TypePlanType.INTERFACE,
      properties: [
        { type: stringPlan, name: 'myString', optional: false },
        { type: childInterfacePlan, name: 'child', optional: false },
      ],
    };

    expect(getTypeAsString(interfacePlan, sourceFile).replace(/\s/g, '')).toBe(`
    {
        myString: string;
        child: {
            name?: string;
        };
    }
    `.replace(/\s/g, ''));
  });

  it('should get reference as string', () => {
    const stringPlan: ReferencePlan = {
      type: TypePlanType.REFERENCE,
      to: 'string',
      libType: true,
    };

    expect(getTypeAsString(stringPlan, sourceFile)).toBe('string');
  });
});
