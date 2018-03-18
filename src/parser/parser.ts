import { GenerationPlan } from '../types/generation-plan';

export interface Parser {
  parse(): GenerationPlan;
}
