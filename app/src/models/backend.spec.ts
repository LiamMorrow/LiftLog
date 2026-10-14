import { basicAuthHeaderValue, parseBasicAuthHeaderValue } from './backend';
import { describe, expect, it } from 'vitest';

describe('basicAuthHeaderValue', () => {
  it('encodes credentials as base64', () => {
    expect(basicAuthHeaderValue('liam', 'hunter2')).toBe('Basic bGlhbTpodW50ZXIy');
  });
});

describe('parseBasicAuthHeaderValue', () => {
  it('round trips credentials', () => {
    const cases: [string, string][] = [
      ['liam', 'hunter2'],
      ['liam', ''],
      ['liam', 'pass:with:colons'],
      ['ünïcode', 'påsswörd'],
    ];
    for (const [username, password] of cases) {
      expect(parseBasicAuthHeaderValue(basicAuthHeaderValue(username, password))).toEqual({ username, password });
    }
  });

  it('is case insensitive about the scheme', () => {
    expect(parseBasicAuthHeaderValue('basic bGlhbTpodW50ZXIy')).toEqual({ username: 'liam', password: 'hunter2' });
  });

  it('rejects values that are not basic auth', () => {
    expect(parseBasicAuthHeaderValue('Bearer bGlhbTpodW50ZXIy')).toBeUndefined();
    expect(parseBasicAuthHeaderValue('Basic not valid base64!')).toBeUndefined();
    expect(parseBasicAuthHeaderValue(`Basic ${Buffer.from('nocolon').toString('base64')}`)).toBeUndefined();
    expect(parseBasicAuthHeaderValue('')).toBeUndefined();
  });
});
