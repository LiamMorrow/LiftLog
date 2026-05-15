// test/setup.ts
import { vi } from 'vitest';

vi.mock('react-native', () => ({}));
vi.mock('react-native-reanimated', () => ({}));
vi.mock('react-native-gesture-handler', () => ({}));
vi.mock('@sentry/react-native', () => ({
  captureEvent: vi.fn(),
  captureException: vi.fn(),
  withScope: vi.fn(
    (
      callback: (scope: { setFingerprint: (value: string[]) => void }) => void,
    ) => callback({ setFingerprint: vi.fn() }),
  ),
  wrap: <T>(component: T) => component,
}));
vi.mock('expo-localization', () => ({}));
vi.mock('expo', () => ({}));
