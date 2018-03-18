import * as path from 'path';
import Project, { Block, InterfaceDeclaration, SourceFile, SyntaxKind } from 'ts-simple-ast';
import { InnerGenerateTypescriptOptions } from './types/generate-typescript-options';
import { ArrayPlan, GenerationPlan, InterfacePlan, PlanType, PropertyPlan, TypePlan } from './types/generation-plan';

export interface GeneratorArguments {
  project: Project;
  generationPlan: GenerationPlan;
  options: InnerGenerateTypescriptOptions;
}

function createFilePath(relativePath: string, options: InnerGenerateTypescriptOptions): string {
  return path.join(options.outputPath, relativePath);
}

export class DefaultGenerator {
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

function getTypeAsString(typePlan: TypePlan): string {
  switch (typePlan.type) {
    case PlanType.ARRAY:
      return `${getTypeAsString(typePlan)}[]`;
    case PlanType.INTERFACE:
      const interfaceDeclaration = new InterfaceDeclaration();
      typePlan.properties.forEach((propPlan: PropertyPlan) => {
        interfaceDeclaration.addProperty({
          name: propPlan.name,
          type: getTypeAsString(propPlan.type),
          hasQuestionToken: propPlan.optional,
        });
      });
      const block: Block = interfaceDeclaration.getChildAtIndexIfKind(0, SyntaxKind.Block)!!;
      return block.getText();
    case PlanType.REFERENCE:
      return typePlan.to;
  }
}
