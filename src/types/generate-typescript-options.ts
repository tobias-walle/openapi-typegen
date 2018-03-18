import { FileSystemHost } from 'ts-simple-ast';

export interface GenerateTypescriptOptions {
  outputPath?: string;
  fileSystemHost?: FileSystemHost;
}

export type InnerGenerateTypescriptOptions = Required<GenerateTypescriptOptions>;