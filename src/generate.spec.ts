import * as fs from 'fs';
import * as path from 'path';
import { FileSystemHost } from 'ts-simple-ast';
import { VirtualFileSystemHost } from 'ts-simple-ast/dist-scripts/src/fileSystem';
import { generateTypescript } from './generate';

const exampleDirectory = path.resolve(__dirname, '..', 'examples');

const petStoreSchema = JSON.parse(
  fs.readFileSync(path.join(exampleDirectory, 'pet-store', 'schema.json'), 'utf-8'),
);

describe('generateTypescript', () => {
  let virtualFileSystem: FileSystemHost;

  beforeEach(() => {
    virtualFileSystem = new VirtualFileSystemHost();
  });

  it('should generate the types of the definitions', () => {
    generateTypescript(petStoreSchema, { outputPath: '.', fileSystemHost: virtualFileSystem });
    const expectedDeclarations = fs.readFileSync(path.join(exampleDirectory, 'pet-store', 'definitions.ts'), 'utf-8');

    expect(virtualFileSystem.readFileSync('definitions.ts')).toBe(expectedDeclarations);
  });
});
