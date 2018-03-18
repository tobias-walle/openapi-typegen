import * as path from 'path';
import Project, { SourceFile } from 'ts-simple-ast';
import { InnerGenerateTypescriptOptions } from '../types/generate-typescript-options';
import { ArrayPlan, GenerationPlan, InterfacePlan, PlanType, PropertyPlan } from '../types/generation-plan';
import { Generator } from './generator';
import { getTypeAsString } from './get-type-as-string';

export interface GeneratorArguments {
  project: Project;
  generationPlan: GenerationPlan;
  options: InnerGenerateTypescriptOptions;
}

function createFilePath(relativePath: string, options: InnerGenerateTypescriptOptions): string {
  return path.join(options.outputPath, relativePath);
}

export class DefaultGenerator implements Generator {
  constructor(private readonly args: GeneratorArguments) {
  }

  public generate() {
    const { project, generationPlan, options } = this.args;

    if (options.fileSystemHost.fileExistsSync('definitions.ts')) {
      options.fileSystemHost.deleteSync('definitions.ts');
    }
    const sourceFile = project.createSourceFile(createFilePath('definitions.ts', options));
    Object.entries(generationPlan.declarations)
      .forEach(([name, plan]) => plan.type === PlanType.INTERFACE
        ? addInterface(sourceFile, plan, name)
        : addArrayTypeAlias(sourceFile, plan, name),
      );
  }
}

function addInterface(sourceFile: SourceFile, plan: InterfacePlan, name: string): void {
  const interfaceDeclaration = sourceFile.addInterface({
    name,
    isExported: true,
  });

  plan.properties.forEach((propPlan: PropertyPlan) => {
    interfaceDeclaration.addProperty({
      name: propPlan.name,
      type: propPlan.type.type === PlanType.REFERENCE ? propPlan.type.to : 'string',
      hasQuestionToken: propPlan.optional,
    });
  });
}

function addArrayTypeAlias(sourceFile: SourceFile, plan: ArrayPlan, name: string): void {
  sourceFile.addTypeAlias({
    name,
    type: `${getTypeAsString(plan.itemType)}[]`,
    isExported: true,
  });
}
