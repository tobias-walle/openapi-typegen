declare module 'swagger-parser' {
  import { OpenAPIObject } from 'openapi3-ts';

  export interface $Refs {
    circular: boolean;

    paths(): string[];

    values(): Record<string, string>;

    exists($ref: string): boolean;

    get<T>($ref: string): T;
  }

  export class SwaggerParser {
    public api: OpenAPIObject | null;
    public $refs: $Refs;

    public validate(api: string | OpenAPIObject): Promise<OpenAPIObject>;

    public dereference(api: string | OpenAPIObject): Promise<OpenAPIObject>;

    public bundle(api: string | OpenAPIObject): Promise<OpenAPIObject>;

    public parse(api: string | OpenAPIObject): Promise<OpenAPIObject>;

    public resolve(api: string | OpenAPIObject): Promise<OpenAPIObject>;
  }
}
