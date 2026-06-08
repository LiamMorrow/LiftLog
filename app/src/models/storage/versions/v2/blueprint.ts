import type { BigNumberJSON } from '../libs';

export interface NoProgressiveOverloadJSON {
  readonly type: 'NoProgressiveOverload';
}

export interface IncreaseAllEvenlyProgressiveOverloadJSON {
  readonly type: 'IncreaseAllEvenlyProgressiveOverload';
  readonly amount: BigNumberJSON;
}

type IncreaseStrategyJSON = 'first' | 'middle' | 'last' | 'all';

export interface IncreaseLowestSetProgressiveOverloadJSON {
  readonly type: 'IncreaseLowestSetProgressiveOverload';
  readonly amount: BigNumberJSON;
  readonly increaseStrategy: IncreaseStrategyJSON;
}

/**
 * @discriminator type
 */
export type ProgressiveOverloadJSON =
  | NoProgressiveOverloadJSON
  | IncreaseAllEvenlyProgressiveOverloadJSON
  | IncreaseLowestSetProgressiveOverloadJSON;
