export function assertUnreachable(value: never): never {
  throw new Error('Unreachable');
}
