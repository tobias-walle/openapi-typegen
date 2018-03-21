import Project from 'ts-simple-ast';
import { InnerGenerateTypescriptOptions } from '../types/generate-typescript-options';
import { GenerationPlan } from '../types/generation-plan';

export interface GeneratorArguments {
  project: Project;
  generationPlan: GenerationPlan;
  options: InnerGenerateTypescriptOptions;
}
