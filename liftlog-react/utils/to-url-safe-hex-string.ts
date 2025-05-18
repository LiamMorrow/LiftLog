export function toUrlSafeHexString(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function fromUrlSafeHexString(hexString: string): Uint8Array;
export function fromUrlSafeHexString(
  hexString: string | null | undefined,
): Uint8Array | null;
export function fromUrlSafeHexString(
  hexString: string | null | undefined,
): Uint8Array | null {
  if (!hexString) {
    return null;
  }

  const length = hexString.length;
  const bytes = new Uint8Array(length / 2);

  for (let i = 0; i < length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
  }

  return bytes;
}
