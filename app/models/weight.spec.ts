import { describe, it, expect } from 'vitest';
import { Weight, shortFormatWeightUnit } from './weight';
import BigNumber from 'bignumber.js';

describe('Weight', () => {
  describe('constructor', () => {
    it('should create weight with BigNumber value', () => {
      const weight = new Weight(new BigNumber(100), 'kilograms');
      expect(weight.value.toNumber()).toBe(100);
      expect(weight.unit).toBe('kilograms');
    });

    it('should create weight with number value', () => {
      const weight = new Weight(50, 'pounds');
      expect(weight.value.toNumber()).toBe(50);
      expect(weight.unit).toBe('pounds');
    });

    it('should create weight with string value', () => {
      const weight = new Weight('75.5', 'kilograms');
      expect(weight.value.toNumber()).toBe(75.5);
      expect(weight.unit).toBe('kilograms');
    });

    it('should have NIL constant', () => {
      expect(Weight.NIL.value.toNumber()).toBe(0);
      expect(Weight.NIL.unit).toBe('nil');
    });
  });

  describe('with', () => {
    it('should update value', () => {
      const weight = new Weight(100, 'kilograms');
      const updated = weight.with({ value: new BigNumber(200) });
      expect(updated.value.toNumber()).toBe(200);
      expect(updated.unit).toBe('kilograms');
    });

    it('should update unit', () => {
      const weight = new Weight(100, 'kilograms');
      const updated = weight.with({ unit: 'pounds' });
      expect(updated.value.toNumber()).toBe(100);
      expect(updated.unit).toBe('pounds');
    });

    it('should update both value and unit', () => {
      const weight = new Weight(100, 'kilograms');
      const updated = weight.with({
        value: new BigNumber(50),
        unit: 'pounds',
      });
      expect(updated.value.toNumber()).toBe(50);
      expect(updated.unit).toBe('pounds');
    });
  });

  describe('plus', () => {
    it('should add two weights with same unit', () => {
      const w1 = new Weight(100, 'kilograms');
      const w2 = new Weight(50, 'kilograms');
      const result = w1.plus(w2);
      expect(result.value.toNumber()).toBe(150);
      expect(result.unit).toBe('kilograms');
    });

    it('should add two weights with different units', () => {
      const w1 = new Weight(100, 'kilograms');
      const w2 = new Weight(220.462, 'pounds');
      const result = w1.plus(w2);
      expect(result.value.toNumber()).toBeCloseTo(200, 5);
      expect(result.unit).toBe('kilograms');
    });

    it('should add BigNumber to weight', () => {
      const weight = new Weight(100, 'pounds');
      const result = weight.plus(new BigNumber(25));
      expect(result.value.toNumber()).toBe(125);
      expect(result.unit).toBe('pounds');
    });
  });

  describe('minus', () => {
    it('should subtract two weights with same unit', () => {
      const w1 = new Weight(100, 'kilograms');
      const w2 = new Weight(30, 'kilograms');
      const result = w1.minus(w2);
      expect(result.value.toNumber()).toBe(70);
      expect(result.unit).toBe('kilograms');
    });

    it('should subtract BigNumber from weight', () => {
      const weight = new Weight(100, 'pounds');
      const result = weight.minus(new BigNumber(25));
      expect(result.value.toNumber()).toBe(75);
      expect(result.unit).toBe('pounds');
    });
  });

  describe('multipliedBy', () => {
    it('should multiply weight by number', () => {
      const weight = new Weight(50, 'kilograms');
      const result = weight.multipliedBy(3);
      expect(result.value.toNumber()).toBe(150);
      expect(result.unit).toBe('kilograms');
    });

    it('should multiply weight by BigNumber', () => {
      const weight = new Weight(50, 'pounds');
      const result = weight.multipliedBy(new BigNumber(2.5));
      expect(result.value.toNumber()).toBe(125);
      expect(result.unit).toBe('pounds');
    });
  });

  describe('isGreaterThan', () => {
    it('should return true when weight is greater', () => {
      const w1 = new Weight(100, 'kilograms');
      const w2 = new Weight(50, 'kilograms');
      expect(w1.isGreaterThan(w2)).toBe(true);
    });

    it('should return false when weight is not greater', () => {
      const w1 = new Weight(50, 'kilograms');
      const w2 = new Weight(100, 'kilograms');
      expect(w1.isGreaterThan(w2)).toBe(false);
    });

    it('should compare across units', () => {
      const w1 = new Weight(100, 'kilograms');
      const w2 = new Weight(100, 'pounds');
      expect(w1.isGreaterThan(w2)).toBe(true);
    });
  });

  describe('max', () => {
    it('should return maximum weight', () => {
      const w1 = new Weight(50, 'kilograms');
      const w2 = new Weight(100, 'kilograms');
      const w3 = new Weight(75, 'kilograms');
      const result = Weight.max(w1, w2, w3);
      expect(result.equals(w2)).toBe(true);
    });

    it('should throw when no weights provided', () => {
      expect(() => Weight.max()).toThrow('No weights!');
    });
  });

  describe('min', () => {
    it('should return minimum weight', () => {
      const w1 = new Weight(50, 'kilograms');
      const w2 = new Weight(100, 'kilograms');
      const w3 = new Weight(75, 'kilograms');
      const result = Weight.min(w1, w2, w3);
      expect(result.equals(w1)).toBe(true);
    });

    it('should throw when no weights provided', () => {
      expect(() => Weight.min()).toThrow('No weights!');
    });
  });

  describe('equals', () => {
    it('should return true for same reference', () => {
      const weight = new Weight(100, 'kilograms');
      expect(weight.equals(weight)).toBe(true);
    });

    it('should return true for equal weights with same unit', () => {
      const w1 = new Weight(100, 'kilograms');
      const w2 = new Weight(100, 'kilograms');
      expect(w1.equals(w2)).toBe(true);
    });

    it('should return false for different units by default', () => {
      const w1 = new Weight(100, 'kilograms');
      const w2 = new Weight(100, 'pounds');
      expect(w1.equals(w2)).toBe(false);
    });

    it('should compare across units when allowDifferentUnits is true', () => {
      const w1 = new Weight(1, 'kilograms');
      const w2 = new Weight(2.20462, 'pounds');
      expect(w1.equals(w2, true)).toBe(true);
    });
  });

  describe('convertTo', () => {
    it('should keep same weight when converting to same unit', () => {
      const weight = new Weight(100, 'kilograms');
      const converted = weight.convertTo('kilograms');
      expect(converted.value.toNumber()).toBe(100);
      expect(converted.unit).toBe('kilograms');
    });

    it('should convert kilograms to pounds', () => {
      const weight = new Weight(100, 'kilograms');
      const converted = weight.convertTo('pounds');
      expect(converted.value.toNumber()).toBeCloseTo(220.462, 3);
      expect(converted.unit).toBe('pounds');
    });

    it('should convert pounds to kilograms', () => {
      const weight = new Weight(220.462, 'pounds');
      const converted = weight.convertTo('kilograms');
      expect(converted.value.toNumber()).toBeCloseTo(100, 3);
      expect(converted.unit).toBe('kilograms');
    });

    it('should convert nil to kilograms', () => {
      const weight = new Weight(50, 'nil');
      const converted = weight.convertTo('kilograms');
      expect(converted.value.toNumber()).toBe(50);
      expect(converted.unit).toBe('kilograms');
    });

    it('should convert nil to pounds', () => {
      const weight = new Weight(50, 'nil');
      const converted = weight.convertTo('pounds');
      expect(converted.value.toNumber()).toBe(50);
      expect(converted.unit).toBe('pounds');
    });

    it('should keep weight when converting to nil', () => {
      const weight = new Weight(100, 'kilograms');
      const converted = weight.convertTo('nil');
      expect(converted).toBe(weight);
    });
  });
});

describe('shortFormatWeightUnit', () => {
  it('should format kilograms', () => {
    expect(shortFormatWeightUnit('kilograms')).toBe('kg');
  });

  it('should format pounds', () => {
    expect(shortFormatWeightUnit('pounds')).toBe('lbs');
  });

  it('should format nil', () => {
    expect(shortFormatWeightUnit('nil')).toBe('-');
  });

  it('should format undefined', () => {
    expect(shortFormatWeightUnit(undefined)).toBe('');
  });
});
