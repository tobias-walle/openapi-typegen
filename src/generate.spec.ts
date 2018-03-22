import * as fs from 'fs';
import * as path from 'path';
import { FileSystemHost } from 'ts-simple-ast';
import { VirtualFileSystemHost } from 'ts-simple-ast/dist-scripts/src/fileSystem';
import { generateTypescript } from './generate';

describe('generateTypescript', () => {
  let virtualFileSystem: FileSystemHost;

  beforeAll(() => {
    virtualFileSystem = new VirtualFileSystemHost();
    generateTypescript(petStoreSchema, { outputPath: '.', fileSystemHost: virtualFileSystem });
  });


  it('should generate the types of the definitions', () => {
    expectFileToMatchExample('definitions.ts');
  });

  it('should generate the api types', () => {
    expectFileToMatchExample('api-types.ts');
  });

  function expectFileToMatchExample(relativePath: string): void {
    expect(virtualFileSystem.readFileSync(relativePath)).toBe(readGeneratedFile(relativePath));
  }
});

const exampleDirectory = path.resolve(__dirname, '..', 'examples');

const petStoreSchema = JSON.parse(
  fs.readFileSync(path.join(exampleDirectory, 'pet-store', 'schema.json'), 'utf-8'),
);

function readGeneratedFile(relativePath: string): string {
  return fs.readFileSync(
    path.join(exampleDirectory, 'pet-store', 'generated', relativePath),
    'utf-8',
  );
}

