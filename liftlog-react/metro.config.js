const { getDefaultConfig } = require('expo/metro-config');
const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = wrapWithReanimatedMetroConfig(config);
