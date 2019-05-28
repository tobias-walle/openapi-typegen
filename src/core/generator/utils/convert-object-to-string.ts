import { QuoteKind } from 'ts-morph';

export function convertObjectToString(object: Record<string, any>, quoteType: QuoteKind): string {
  const properties = Object.getOwnPropertyNames(object)
    .map((name) => {
      const value = getStringRepresentation(object[name], quoteType);
      return `${name}: ${value}`;
    }).join(',\n');
  return `{\n${properties}\n}`;
}

function getStringRepresentation(value: any, quoteType: QuoteKind): string {
  switch (typeof value) {
    case 'object':
      if (value instanceof Array) {
        const items = value.map(v => getStringRepresentation(v, quoteType)).join(',\n');
        return `[\n${items}\n]`;
      } else {
        return convertObjectToString(value, quoteType);
      }
    case 'string':
      return `${quoteType}${value}${quoteType}`;
  }
  return String(value);
}
