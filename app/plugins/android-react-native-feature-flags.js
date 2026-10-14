const { withMainApplication } = require('@expo/config-plugins');

const IMPORT_ANCHOR = 'import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint';

const IMPORTS = `import com.facebook.react.internal.featureflags.ReactNativeFeatureFlags
import com.facebook.react.internal.featureflags.ReactNativeNewArchitectureFeatureFlagsDefaults`;

const LOAD_ANCHOR = /(loadReactNative\(this\)\n)/;

const OVERRIDE = `    // loadReactNative already installed the stable feature-flag overlay and
    // override() may only be called once, so force-replace it with an
    // equivalent provider that also enables the use-after-free fix for
    // findShadowNodeByTag_DEPRECATED (crash in focusSearch on tapping a
    // TextInput). The fix is unconditional in RN 0.87+; remove on upgrade.
    ReactNativeFeatureFlags.dangerouslyForceOverride(
      object : ReactNativeNewArchitectureFeatureFlagsDefaults() {
        override fun fixFindShadowNodeByTagRaceCondition(): Boolean = true
      }
    )
`;

module.exports = function withAndroidReactNativeFeatureFlags(config) {
  return withMainApplication(config, (config) => {
    let contents = config.modResults.contents;
    if (contents.includes('fixFindShadowNodeByTagRaceCondition')) {
      return config;
    }
    if (!contents.includes(IMPORT_ANCHOR) || !LOAD_ANCHOR.test(contents)) {
      throw new Error('android-react-native-feature-flags: MainApplication.kt no longer matches the expected template');
    }
    contents = contents.replace(IMPORT_ANCHOR, `${IMPORT_ANCHOR}\n${IMPORTS}`);
    contents = contents.replace(LOAD_ANCHOR, `$1${OVERRIDE}`);
    config.modResults.contents = contents;
    return config;
  });
};
