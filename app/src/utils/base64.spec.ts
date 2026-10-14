import { fromBase64, toBase64 } from './base64';
import { describe, expect, it } from 'vitest';

describe('base64', () => {
  it('round trips text', () => {
    for (const text of ['', 'liam', 'a:b:c', 'ünïcode påsswörd', 'padding?']) {
      expect(fromBase64(toBase64(text))).toBe(text);
    }
  });

  it('accepts base64 without padding', () => {
    expect(fromBase64('bGlhbQ')).toBe('liam');
  });

  it('rejects text that is not base64', () => {
    expect(fromBase64('not valid base64!')).toBeUndefined();
  });
});
