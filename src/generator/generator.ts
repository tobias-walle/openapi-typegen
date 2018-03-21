import * as path from 'path';
import { SourceFile } from 'ts-simple-ast';
import { InnerGenerateTypescriptOptions } from '../types/generate-typescript-options';
import { GeneratorArguments } from './generator-arguments';

export abstract class Generator {
  constructor(protected readonly args: GeneratorArguments) {
  }

  public abstract generate(): void;

  protected setupFile(relativePath: string): SourceFile {
    const { project, options } = this.args;
    const filePath = createFilePath(relativePath, options);
    if (options.fileSystemHost.fileExistsSync(filePath)) {
      options.fileSystemHost.deleteSync(filePath);
    }
    return project.createSourceFile(filePath);
  }
}

function createFilePath(relativePath: string, options: InnerGenerateTypescriptOptions): string {
  return path.join(options.outputPath, relativePath);
}
