import { ParserArguments } from '../parser/default-parser';
import { GenerationPlan } from '../type-plans';

export abstract class Parser {
  constructor(protected readonly args: ParserArguments) {
  }

  public abstract parse(): GenerationPlan;
}
