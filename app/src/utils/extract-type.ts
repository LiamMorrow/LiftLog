export type ExtractType<T extends { type: string }, TType extends T['type']> = Extract<T, { type: TType }>;
