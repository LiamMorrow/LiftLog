import { BuiltInPrograms } from '@/models/built-in-programs';
import { describe, expect, it } from 'vitest';

describe('built-in-programs', () => {
  it('can get a program', () => {
    expect(BuiltInPrograms).toBeDefined();
  });
});
