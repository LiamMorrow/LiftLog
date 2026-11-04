const { withAppBuildGradle, CodeGenerator } = require('@expo/config-plugins');

module.exports = function withAndroidVersionFromGradleProperties(config) {
  return withAppBuildGradle(config, (config) => {
    config.modResults.contents = CodeGenerator.mergeContents({
      src: config.modResults.contents,
      comment: '//',
      tag: 'liftlog-version-from-gradle-properties',
      anchor: /versionName "[^"]+"/,
      offset: 1,
      newSrc: [
        "        if (project.hasProperty('BUILD_NUMBER')) {",
        "            versionCode project.property('BUILD_NUMBER').toInteger()",
        '        }',
        "        if (project.hasProperty('DISPLAY_VERSION')) {",
        "            versionName project.property('DISPLAY_VERSION')",
        '        }',
      ].join('\n'),
    }).contents;
    return config;
  });
};
