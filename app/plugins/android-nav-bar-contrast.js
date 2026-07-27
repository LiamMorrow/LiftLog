const { withAndroidStyles, AndroidConfig } = require('@expo/config-plugins');
/*
  In edge-to-edge, the system enforces a translucent contrast scrim behind the
  navigation bar in 3-button/2-button modes (never gesture mode). That scrim
  washes the NativeTabs background out to white. Opting out lets the tab bar's
  own colour paint the full nav bar area in every navigation mode.
 */
function withNavBarContrast(config) {
  return withAndroidStyles(config, (config) => {
    config.modResults = AndroidConfig.Styles.assignStylesValue(config.modResults, {
      add: true,
      parent: AndroidConfig.Styles.getAppThemeGroup(),
      name: 'android:enforceNavigationBarContrast',
      value: 'false',
    });
    return config;
  });
}

module.exports = withNavBarContrast;
