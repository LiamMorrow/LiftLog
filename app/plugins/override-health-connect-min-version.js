const { withAndroidManifest } = require('@expo/config-plugins');
/*
  The HealthConnect library we use want min SDK of 26,
  but I'd like to keep supporting 24. As long as we are diligent in guarding it, we should be fine
 */
function withCustomManifest(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    manifest['uses-sdk'] ??= [];

    if (
      !manifest['uses-sdk'].find(
        (x) =>
          x.$?.['tools:overrideLibrary'] === 'androidx.health.connect.client',
      )
    ) {
      manifest['uses-sdk'].push({
        $: {
          'tools:overrideLibrary': 'androidx.health.connect.client',
        },
      });
    }

    return config;
  });
}

module.exports = withCustomManifest;
