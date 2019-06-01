import { SourceFile, VariableDeclarationKind } from 'ts-morph';
import { Generator } from '../types';
import { convertObjectToString } from './utils';

export class ApiMappingGenerator extends Generator {
  public generate(): void {
    const sourceFile = this.setupFile('api-mapping.ts', template);
    this.setupApiMappingConstant(sourceFile);
  }

  private setupApiMappingConstant(sourceFile: SourceFile): void {
    sourceFile.addVariableStatement({
      isExported: true,
      declarationKind: VariableDeclarationKind.Const,
      declarations: [{
        name: 'apiMapping',
        type: 'ApiMapping',
        initializer: this.getApiMapping(),
      }],
    });
  }

  private getApiMapping(): string {
    const { generationPlan, project } = this.args;
    const mapping: {
      [key: string]: {
        url: string,
        method: string,
        tags: string[],
      },
    } = {};
    Object.values(generationPlan.api)
      .forEach((apiPlan) => {
        mapping[apiPlan.operationId] = {
          url: apiPlan.url,
          method: apiPlan.method,
          tags: apiPlan.tags,
        };
      });
    return convertObjectToString(mapping, project.manipulationSettings.getQuoteKind());
  }
}

const template = `
import { Method } from 'axios';
import { ApiOperationIds, ApiTypes } from './api-types';

export interface ApiMappingItem<key extends ApiOperationIds> {
  url: string;
  method: Method;
  tags: Array<ApiTypes[key]['tag']>;
}

export type ApiMapping = {
  [key in keyof ApiTypes]: ApiMappingItem<key>
};
`.trim();
