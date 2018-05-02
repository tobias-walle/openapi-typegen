#!/usr/bin/env node
import ora from 'ora';
import { generateTypescript } from '../core';
import { getSchema } from './get-schema';
import { parseArguments } from './parse-arguments';

const options = parseArguments();

const spinners = {
  schema: ora(`Get Schema from '${options.src}'`),
  generate: ora(`Generate Api to '${options.out}'`),
};

let currentSpinner: keyof typeof spinners | undefined;

function startSpinner(name: keyof typeof spinners): void {
  currentSpinner = name;
  spinners[name].start();
}

function stopSpinner(): void {
  if (currentSpinner) {
    spinners[currentSpinner].succeed();
  }
}

function stopSpinnerWithError(): void {
  if (currentSpinner) {
    spinners[currentSpinner].fail();
  }
}

(async () => {
  startSpinner('schema');
  const schema = await getSchema(options.src);
  stopSpinner();

  startSpinner('generate');
  await generateTypescript(schema, { outputPath: options.out });
  stopSpinner();
})().catch(err => {
  stopSpinnerWithError();
  console.error(err);
});
