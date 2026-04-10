export class UuidConversionError extends Error {
  constructor(
    public readonly value: Uint8Array,
    options: ErrorOptions,
  ) {
    super('Error converting UUID', options);
    this.name = UuidConversionError.name;
  }
}
