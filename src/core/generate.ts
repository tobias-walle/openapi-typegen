import { OpenAPIObject } from 'openapi3-ts';
import Project, { IndentationText, QuoteKind } from 'ts-morph';
import {
  ApiMappingGenerator,
  ApiTypesGenerator,
  AxiosGenerator,
  DefinitionsGenerator,
  GeneratorArguments
} from './generator';
import { DefaultParser, ParserArguments } from './parser';
import { GenerateTypescriptOptions, InnerGenerateTypescriptOptions } from './types';

const defaultOptions: InnerGenerateTypescriptOptions = {
  outputPath: './typegen',
  useVirtualFileSystem: false
};

export function generateTypescript(schema: OpenAPIObject, customOptions?: GenerateTypescriptOptions): Project {
  const options: InnerGenerateTypescriptOptions = {
    ...defaultOptions,
    ...(customOptions || {}),
  };

  const project = new Project(
    {
      compilerOptions: {
        rootDir: options.outputPath,
      },
      manipulationSettings: {
        quoteKind: QuoteKind.Single,
        indentationText: IndentationText.TwoSpaces,
      },
      useVirtualFileSystem: options.useVirtualFileSystem
    },
  );

  const parserArgs: ParserArguments = { schema, options };
  const generationPlan = new DefaultParser(parserArgs).parse();

  const generateArgs: GeneratorArguments = { project, options, generationPlan };
  new DefinitionsGenerator(generateArgs).generate();
  new ApiTypesGenerator(generateArgs).generate();
  new ApiMappingGenerator(generateArgs).generate();
  new AxiosGenerator(generateArgs).generate();

  project.getSourceFiles()
    .map((file) => file.formatText({
      ensureNewLineAtEndOfFile: true,
      insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
    }));

  project.saveSync();

  return project;
}
