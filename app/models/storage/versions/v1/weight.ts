import { BigNumberJSON } from '../libs';

export type WeightUnitJSON = 'kilograms' | 'pounds' | 'nil';

export type WeightJSON = {
  unit: WeightUnitJSON;
  value: BigNumberJSON;
};
