export interface GenerateTypescriptOptions {
  outputPath?: string;
  useVirtualFileSystem?: boolean;
}

export type InnerGenerateTypescriptOptions = Required<GenerateTypescriptOptions>;
