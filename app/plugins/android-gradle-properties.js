const { withGradleProperties } = require('@expo/config-plugins');

const GRADLE_PROPERTIES = {
  'org.gradle.jvmargs': '-Xmx6g -XX:MaxMetaspaceSize=1g',
  'org.gradle.caching': 'true',
};

module.exports = function withAndroidGradleProperties(config) {
  return withGradleProperties(config, (config) => {
    for (const [key, value] of Object.entries(GRADLE_PROPERTIES)) {
      const existing = config.modResults.find(
        (item) => item.type === 'property' && item.key === key,
      );
      if (existing) {
        existing.value = value;
      } else {
        config.modResults.push({ type: 'property', key, value });
      }
    }
    return config;
  });
};
