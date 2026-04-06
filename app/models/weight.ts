import { LiftLog } from '@/gen/proto';
import { localeFormatBigNumber } from '@/utils/locale-bignumber';
import BigNumber from 'bignumber.js';
import { match, P } from 'ts-pattern';
import { toDecimalDao } from './storage/conversions.to-dao';
import { fromDecimalDao } from './storage/conversions.from-dao';
import { fromBigNumberJSON, WeightJSON } from './storage/versions/latest';

// nil is special in that it basically tries to coalesce into whatever else is given
export type WeightUnit = 'kilograms' | 'pounds' | 'nil';

export class Weight {
  public value: BigNumber;

  static readonly NIL = new Weight(0, 'nil');

  constructor(
    value: BigNumber | number | string,
    public readonly unit: WeightUnit,
  ) {
    this.value = value instanceof BigNumber ? value : new BigNumber(value);
  }

  toDao(): LiftLog.Ui.Models.Weight {
    return LiftLog.Ui.Models.Weight.create({
      unit: toWeightUnitDao(this.unit),
      value: toDecimalDao(this.value),
    });
  }

  static fromDao(value: LiftLog.Ui.Models.IWeight): Weight {
    return new Weight(
      fromDecimalDao(value.value!),
      fromWeightUnitDao(value.unit),
    );
  }

  static fromJSON(value: WeightJSON): Weight {
    return new Weight(fromBigNumberJSON(value.value), value.unit);
  }

  with(other: Partial<Weight>): Weight {
    return new Weight(other.value ?? this.value, other.unit ?? this.unit);
  }

  /**
   * Adds two weights, or a weight and a number, keeping the current unit
   */
  plus(val: Weight | BigNumber): Weight {
    if (val instanceof Weight) {
      return val.convertTo(this.unit).plus(this.value);
    }
    return new Weight(this.value.plus(val), this.unit);
  }

  abs(): Weight {
    return new Weight(this.value.abs(), this.unit);
  }

  /**
   * Subtracts two weights, or a weight and a number, keeping the current unit
   */
  minus(val: Weight | BigNumber): Weight {
    if (val instanceof Weight) {
      return this.minus(val.convertTo(this.unit).value);
    }
    return new Weight(this.value.minus(val), this.unit);
  }

  multipliedBy(val: BigNumber | number): Weight {
    return new Weight(this.value.multipliedBy(val), this.unit);
  }

  isGreaterThan(max: Weight): boolean {
    return this.convertTo(max.unit).value.isGreaterThan(max.value);
  }

  static max(...weights: Weight[]): Weight {
    let maxWeight: Weight | undefined;
    for (const weight of weights) {
      if (!maxWeight || weight.isGreaterThan(maxWeight)) {
        maxWeight = weight;
      }
    }
    if (!maxWeight) {
      throw new Error('No weights!');
    }
    return maxWeight;
  }

  static min(...weights: Weight[]): Weight {
    let min: Weight | undefined;
    for (const weight of weights) {
      if (!min || !weight.isGreaterThan(min)) {
        min = weight;
      }
    }
    if (!min) {
      throw new Error('No weights!');
    }
    return min;
  }

  equals(other: Weight, allowDifferentUnits = false): boolean {
    if (other === this) {
      return true;
    }
    if (other.unit !== this.unit) {
      return allowDifferentUnits && this.convertTo(other.unit).equals(other);
    }
    return other.value.eq(this.value);
  }

  convertTo(unit: WeightUnit): Weight {
    return match([this.unit, unit])
      .with([P._, 'nil'], () => this)
      .with(['kilograms', 'kilograms'], () => this)
      .with(['pounds', 'pounds'], () => this)
      .with(
        ['kilograms', 'pounds'],
        () => new Weight(this.value.multipliedBy(2.20462), 'pounds'),
      )
      .with(
        ['pounds', 'kilograms'],
        () => new Weight(this.value.dividedBy(2.20462), 'kilograms'),
      )
      .with(['nil', 'kilograms'], () => new Weight(this.value, 'kilograms'))
      .with(['nil', 'pounds'], () => new Weight(this.value, 'pounds'))
      .exhaustive();
  }

  shortLocaleFormat(decimalPlaces?: number) {
    return (
      localeFormatBigNumber(this.value, decimalPlaces) +
      shortFormatWeightUnit(this.unit)
    );
  }
}

export function shortFormatWeightUnit(unit: WeightUnit | undefined): string {
  return match(unit)
    .with('kilograms', () => 'kg')
    .with('pounds', () => 'lbs')
    .with('nil', () => '-')
    .with(undefined, () => '')
    .exhaustive();
}

export function toWeightUnitDao(
  weightUnit: WeightUnit,
): LiftLog.Ui.Models.WeightUnit {
  return match(weightUnit)
    .with('kilograms', () => LiftLog.Ui.Models.WeightUnit.KILOGRAMS)
    .with('pounds', () => LiftLog.Ui.Models.WeightUnit.POUNDS)
    .with('nil', () => LiftLog.Ui.Models.WeightUnit.NIL)
    .exhaustive();
}

export function fromWeightUnitDao(
  daoUnit: LiftLog.Ui.Models.WeightUnit | null | undefined,
): WeightUnit {
  return match(daoUnit)
    .returnType<WeightUnit>()
    .with(P.nullish, () => 'nil')
    .with(LiftLog.Ui.Models.WeightUnit.NIL satisfies 0 as 0, () => 'nil')
    .with(
      LiftLog.Ui.Models.WeightUnit.KILOGRAMS satisfies 1 as 1,
      () => 'kilograms',
    )
    .with(LiftLog.Ui.Models.WeightUnit.POUNDS satisfies 2 as 2, () => 'pounds')
    .exhaustive();
}
