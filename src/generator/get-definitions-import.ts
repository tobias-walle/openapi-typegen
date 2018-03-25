import { GenerationPlan } from '../types/generation-plan';

export function getDefinitionsImport(definitions: GenerationPlan['definitions']): string {
  const definitionImports: string[] = getDefinitionReferenceNames(definitions);
  return `import { ${definitionImports.join(',\n')} } from './definitions'`;
}

function  getDefinitionReferenceNames(definitions: GenerationPlan['definitions']): string[] {
  return Object.keys(definitions).sort();
}
