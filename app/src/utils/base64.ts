export function toBase64(text: string): string {
  return Buffer.from(text, 'utf8').toString('base64');
}

/**
 * Base64 decoding accepts far more than it should, so anything that does not re-encode to what came
 * in is reported as not base64 rather than silently mangled. Padding is not compared.
 */
export function fromBase64(base64: string): string | undefined {
  const decoded = Buffer.from(base64, 'base64').toString('utf8');
  const unpadded = (text: string) => text.replace(/=+$/, '');
  return unpadded(toBase64(decoded)) === unpadded(base64) ? decoded : undefined;
}
