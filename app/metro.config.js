const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');
const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

// Add wasm asset support
config.resolver.assetExts.push('wasm');
config.resolver.sourceExts.push('sql');

module.exports = wrapWithReanimatedMetroConfig(config);
