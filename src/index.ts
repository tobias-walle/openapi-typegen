import * as fs from 'fs';
import { IOpenApiObject } from 'open-api.d.ts';
import * as path from 'path';
import { generateTypescript } from './core/generate';

const schema: IOpenApiObject = JSON.parse(fs.readFileSync(`${__dirname}/../examples/pet-store/schema.json`, 'utf-8'));

generateTypescript(schema, {
  outputPath: path.resolve(__dirname, '..', 'generated'),
});
