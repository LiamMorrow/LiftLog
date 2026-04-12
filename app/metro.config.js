const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname, {
  annotateReactComponents: true,
});

config.resolver.sourceExts.push('sql');
config.resolver.assetExts.push('wasm');

module.exports = wrapWithReanimatedMetroConfig(config);
