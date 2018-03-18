import { IOpenApiObject } from 'open-api.d.ts';
import Project from 'ts-simple-ast';
import { DefaultFileSystemHost } from 'ts-simple-ast/dist-scripts/src/fileSystem';
import { DefaultGenerator, GeneratorArguments } from './generator/default-generator';
import { DefaultParser, ParserArguments } from './parser/default-parser';
import { GenerateTypescriptOptions, InnerGenerateTypescriptOptions } from './types/generate-typescript-options';

const defaultOptions = {
  outputPath: './typegen',
  fileSystemHost: new DefaultFileSystemHost(),
};

export function generateTypescript(schema: IOpenApiObject, customOptions: GenerateTypescriptOptions): void {
  const options: InnerGenerateTypescriptOptions = {
    ...defaultOptions,
    ...customOptions,
  };

  const project = new Project(
    {
      compilerOptions: {
        rootDir: options.outputPath,
      },
    },
    options.fileSystemHost,
  );

  const parserArgs: ParserArguments = { schema, options };
  const generationPlan = new DefaultParser(parserArgs).parse();

  const generateArgs: GeneratorArguments = { project, options, generationPlan };
  new DefaultGenerator(generateArgs).generate();

  project.saveSync();
}
