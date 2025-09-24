export type DeepOmit<T, K extends PropertyKey> = K extends keyof T
  ? T extends object
    ? T extends (infer U)[]
      ? DeepOmit<U, K>[]
      : {
          [P in keyof T as P extends K ? never : P]: DeepOmit<T[P], K>;
        }
    : T
  : T extends (infer U)[]
    ? DeepOmit<U, K>[]
    : T;
