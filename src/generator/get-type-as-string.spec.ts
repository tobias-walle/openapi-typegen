import { default as Project, SourceFile } from 'ts-simple-ast';
import { VirtualFileSystemHost } from 'ts-simple-ast/dist-scripts/src/fileSystem';
import { ArrayPlan, InterfacePlan, PlanType, ReferencePlan } from '../types/generation-plan';
import { getTypeAsString } from './get-type-as-string';

describe('getTypeAsString', () => {
  let sourceFile: SourceFile;

  beforeEach(() => {
    sourceFile = new Project({}, new VirtualFileSystemHost()).createSourceFile('temp.ts');
  });

  afterEach(() => {
    expect(sourceFile.getInterfaces().length).toBe(0);
  });

  it('should get array as string', () => {
    const stringPlan: ReferencePlan = {
      type: PlanType.REFERENCE,
      to: 'string',
    };
    const arrayPlan: ArrayPlan = {
      type: PlanType.ARRAY,
      itemType: stringPlan,
    };

    expect(getTypeAsString(arrayPlan, sourceFile)).toBe('string[]');
  });

  it('should get interface as string', () => {
    const stringPlan: ReferencePlan = {
      type: PlanType.REFERENCE,
      to: 'string',
    };
    const childInterfacePlan: InterfacePlan = {
      type: PlanType.INTERFACE,
      properties: [
        { type: stringPlan, name: 'name', optional: true },
      ],
    };
    const interfacePlan: InterfacePlan = {
      type: PlanType.INTERFACE,
      properties: [
        { type: stringPlan, name: 'myString', optional: false },
        { type: childInterfacePlan, name: 'child', optional: false },
      ],
    };

    expect(getTypeAsString(interfacePlan, sourceFile)).toBe(`
{
    myString: string;
    child: {
        name?: string;
    };
}
    `.trim());
  });

  it('should get reference as string', () => {
    const stringPlan: ReferencePlan = {
      type: PlanType.REFERENCE,
      to: 'string',
    };

    expect(getTypeAsString(stringPlan, sourceFile)).toBe('string');
  });
});
