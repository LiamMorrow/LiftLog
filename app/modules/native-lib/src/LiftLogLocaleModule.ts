import { NativeModule, requireOptionalNativeModule } from 'expo';

declare class LiftLogLocaleModule extends NativeModule {
  getApplicationLanguage(): string | null;
  setApplicationLanguage(languageTag: string | null): void;
}

const getModule = () => requireOptionalNativeModule<LiftLogLocaleModule>('LiftLogLocale');

export function getApplicationLanguage(): string | undefined {
  return getModule()?.getApplicationLanguage() ?? undefined;
}

export function setApplicationLanguage(languageTag: string | undefined) {
  getModule()?.setApplicationLanguage(languageTag ?? null);
}
