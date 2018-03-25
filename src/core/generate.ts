import { IOpenApiObject } from 'open-api.d.ts';
import Project, { IndentationText, QuoteType } from 'ts-simple-ast';
import { DefaultFileSystemHost } from 'ts-simple-ast/dist-scripts/src/fileSystem';
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
  fileSystemHost: new DefaultFileSystemHost(),
};

export function generateTypescript(schema: IOpenApiObject, customOptions?: GenerateTypescriptOptions): void {
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
        quoteType: QuoteType.Single,
        indentationText: IndentationText.TwoSpaces,
      },
    },
    options.fileSystemHost,
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
}
