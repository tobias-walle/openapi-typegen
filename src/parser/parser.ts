import { GenerationPlan } from '../types/generation-plan';
import { ParserArguments } from './default-parser';

export abstract class Parser {
  constructor(protected readonly args: ParserArguments) {
  }

  public abstract parse(): GenerationPlan;
}
