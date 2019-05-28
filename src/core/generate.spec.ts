import * as fs from 'fs';
import * as path from 'path';
import { FileSystemHost } from 'ts-morph';
import { generateTypescript } from './generate';

describe('generateTypescript', () => {
  let virtualFileSystem: FileSystemHost;

  beforeAll(() => {
    const project = generateTypescript(petStoreSchema, { outputPath: '.', useVirtualFileSystem: true });
    virtualFileSystem = project.getFileSystem();
  });

  it('should generate the types of the definitions', () => {
    expectFileToMatchExample('definitions.ts');
  });

  it('should generate the api types', () => {
    expectFileToMatchExample('api-types.ts');
  });

  it('should generate the api mapping', () => {
    expectFileToMatchExample('api-mapping.ts');
  });

  it('should generate the axios api', () => {
    expectFileToMatchExample('api-utils.ts');
    expectFileToMatchExample('create-api.ts');
  });

  function expectFileToMatchExample(relativePath: string): void {
    expect(virtualFileSystem.readFileSync(relativePath)).toBe(readGeneratedFile(relativePath));
  }
});

const exampleDirectory = path.resolve(__dirname, '..', '..', 'examples');

const petStoreSchema = JSON.parse(
  fs.readFileSync(path.join(exampleDirectory, 'pet-store', 'schema.json'), 'utf-8'),
);

function readGeneratedFile(relativePath: string): string {
  return fs.readFileSync(
    path.join(exampleDirectory, 'pet-store', 'generated', relativePath),
    'utf-8',
  );
}
