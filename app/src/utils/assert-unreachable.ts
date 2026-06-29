export function assertUnreachable(_value: never): never {
  throw new Error('Unreachable');
}
