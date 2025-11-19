// test/setup.ts
import { vi } from 'vitest';

vi.mock('react-native', () => ({}));
vi.mock('react-native-reanimated', () => ({}));
vi.mock('react-native-gesture-handler', () => ({}));
vi.mock('expo-localization', () => ({}));
vi.mock('expo', () => ({}));
