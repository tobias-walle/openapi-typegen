import * as fs from 'fs';
import * as http from 'http';
import { IncomingMessage } from 'http';
import { getSchema } from './get-schema';

jest.mock('fs', () => ({
  readFile: jest.fn((path: string, encoding: string, callback: (err: Error | null, data: string) => void) => {
    callback(null, '{}');
  })
}));
jest.mock('http', () => ({
  get: jest.fn((url: string, callback: (res: IncomingMessage) => void) => {
    const message = {
      headers: {
        'content-type': 'application/json'
      },
      statusCode: 200,
      setEncoding: () => {
        // Do nothing
      },
      on: (status: string, eventCallback: (data?: string) => void) => {
        if (status === 'data') {
          eventCallback('{}');
        } else if (status === 'end') {
          eventCallback();
        }
      }
    };
    callback(message as any);
  })
}));

describe('getSchema', () => {
  const networkPaths = [
    'http://localhost',
    'https://localhost',
    'https://127.0.0.1',
    'http://[::1]/test',
  ];
  networkPaths.forEach((path) => {
    it(`should get the schema from the network with path ${path}`, async () => {
      expect(await getSchema(path)).toEqual({});
      expect(fs.readFile).not.toHaveBeenCalled();
      expect(http.get).toHaveBeenCalledWith(path, expect.anything());
    });
  });

  const localpaths = [
    './',
    './schema.json',
    '/test/test2'
  ];
  localpaths.forEach((path) => {
    it(`should get the schema from the filesystem with path ${path}`, async () => {
      spyOn(http, 'get');
      expect(await getSchema(path)).toEqual({});
      expect(http.get).not.toHaveBeenCalled();
      expect(fs.readFile).toHaveBeenCalledWith(path, 'utf8', expect.anything());
    });
  });

});
