import args from 'args';

export interface CliOptions {
  src: string;
  out: string;
}

export function parseArguments(): CliOptions {
  const flags = args
    .option('src', 'The path to the open-api definition')
    .option('out', 'The output path of the generated files')
    .parse(process.argv);
  validateCliOptions(flags);
  return flags as any;
}

function validateCliOptions(options: Partial<CliOptions>): void {
  const requiredOptions: (keyof CliOptions)[] = [
    'src',
    'out'
  ];
  requiredOptions.forEach(name => assertOption(options, name));
}

function assertOption(options: Partial<CliOptions>, name: keyof CliOptions): void {
  if (!(name in options)) {
    throw new Error(`The "${name}" option is required\n`);
  }
}
