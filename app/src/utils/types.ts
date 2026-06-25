export type KeysOfType<T, TKeyType> = {
  [K in keyof T]: T[K] extends TKeyType ? K : never;
}[keyof T];
export type DeepPartial<T> = T extends
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  ? T
  : T extends readonly (infer U)[]
    ? DeepPartial<U>[]
    : T extends object
      ? {
          [P in keyof T]?: DeepPartial<T[P]>;
        }
      : T;
