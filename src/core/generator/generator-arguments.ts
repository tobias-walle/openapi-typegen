import { Project } from 'ts-morph';
import { GenerationPlan } from '../type-plans';
import { InnerGenerateTypescriptOptions } from '../types/generate-typescript-options';

export interface GeneratorArguments {
  project: Project;
  generationPlan: GenerationPlan;
  options: InnerGenerateTypescriptOptions;
}
