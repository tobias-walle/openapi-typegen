import * as path from 'path';
import { SourceFile } from 'ts-simple-ast';
import { GeneratorArguments } from '../generator/generator-arguments';
import { InnerGenerateTypescriptOptions } from './generate-typescript-options';

export abstract class Generator {
  constructor(protected readonly args: GeneratorArguments) {
  }

  public abstract generate(): void;

  protected setupFile(relativePath: string, text?: string): SourceFile {
    const { project, options } = this.args;
    const filePath = createFilePath(relativePath, options);
    if (options.fileSystemHost.fileExistsSync(filePath)) {
      options.fileSystemHost.deleteSync(filePath);
    }
    return project.createSourceFile(filePath, text as string);
  }
}

function createFilePath(relativePath: string, options: InnerGenerateTypescriptOptions): string {
  return path.join(options.outputPath, relativePath);
}
