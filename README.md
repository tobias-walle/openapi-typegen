# Openapi Typegen
[![Build Status](https://travis-ci.org/TobiasWalle/openapi-typegen.svg?branch=master)](https://travis-ci.org/TobiasWalle/openapi-typegen)
[![Coverage Status](https://coveralls.io/repos/github/TobiasWalle/openapi-typegen/badge.svg?branch=master)](https://coveralls.io/github/TobiasWalle/openapi-typegen?branch=master)
[![npm version](https://badge.fury.io/js/openapi-typegen.svg)](https://badge.fury.io/js/openapi-typegen)

Generates typescript code to access your api based on the openapi (swagger) json files.
The generated files are completely typesafe.

## Installation
With npm
```bash
$ npm install --global openapi-typegen`
```
With yarn
```bash
$ yarn global add openapi-typegen
```

## Usage
### 1. Generate the files with the cli tool
```bash
$ typegen --src <path-or-url-to-schema> --out <output-directory>
```
For example
```bash
$ typegen --src http://localhost:8080/v2/api-docs --out ./generated 
```

### 2. Use the generated files in your application
```typescript
import { createApi } from './generated/create-api';

const api = createApi({
  host: '/', // Override the host, the default is the value from the schema
  baseUrl: 'api' // Override the base url, default is the base url from the schema
});

// Now you can use the api as the following. The function names will be generated
// based on the operationIds
api.findPetsByTags({
  query: {
    tags: ['available']
  }
})
  .then(response => console.log(`Found pets ${response.data}`))
  .catch(error => console.error('Error while searching pets'));
```

## Example
For an example of the generated files please take a look at the [pet-store example](./examples/pet-store).

