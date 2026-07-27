import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { hexToHsv, hsvToHex } from './color';

describe('hsvToHex', () => {
  it('produces an uppercase 6-digit hex', () => {
    expect(hsvToHex(0, 1, 1)).toMatch(/^#[0-9A-F]{6}$/);
  });

  it('maps known colors', () => {
    expect(hsvToHex(0, 1, 1)).toBe('#FF0000');
    expect(hsvToHex(120, 1, 1)).toBe('#00FF00');
    expect(hsvToHex(240, 1, 1)).toBe('#0000FF');
    expect(hsvToHex(0, 0, 1)).toBe('#FFFFFF');
    expect(hsvToHex(0, 0, 0)).toBe('#000000');
  });

  it('wraps hue and clamps out-of-range channels', () => {
    expect(hsvToHex(360, 1, 1)).toBe('#FF0000');
    expect(hsvToHex(-360, 1, 1)).toBe('#FF0000');
    expect(hsvToHex(0, 2, 2)).toBe('#FF0000');
  });
});

describe('hexToHsv', () => {
  it('parses known colors', () => {
    expect(hexToHsv('#FF0000')).toMatchObject({ h: 0, s: 1, v: 1 });
    expect(hexToHsv('#000000')).toMatchObject({ s: 0, v: 0 });
    expect(hexToHsv('#FFFFFF')).toMatchObject({ s: 0, v: 1 });
  });

  it('tolerates missing hash and mixed case', () => {
    expect(hexToHsv('00ff00')).toMatchObject({ h: 120, s: 1, v: 1 });
  });

  it('returns black for garbage', () => {
    expect(hexToHsv('nope')).toEqual({ h: 0, s: 0, v: 0 });
  });
});

describe('hex/hsv round trip', () => {
  it('hsvToHex ∘ hexToHsv is stable on hex', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 0xffffff }), (int) => {
        const hex = `#${int.toString(16).padStart(6, '0').toUpperCase()}` as const;
        const { h, s, v } = hexToHsv(hex);
        expect(hsvToHex(h, s, v)).toBe(hex);
      }),
    );
  });
});
