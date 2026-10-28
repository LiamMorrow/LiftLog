const { withAndroidManifest, withDangerousMod, AndroidConfig } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const fileName = 'network_security_config';

const networkSecurityConfig = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
</network-security-config>
`;

function withAndroidNetworkSecurityConfig(config) {
  config = withDangerousMod(config, [
    'android',
    (config) => {
      const dir = path.join(config.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res', 'xml');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${fileName}.xml`), networkSecurityConfig);
      return config;
    },
  ]);

  return withAndroidManifest(config, (config) => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
    application.$['android:networkSecurityConfig'] = `@xml/${fileName}`;
    return config;
  });
}

module.exports = withAndroidNetworkSecurityConfig;
