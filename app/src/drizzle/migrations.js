// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_purple_betty_ross.sql';
import m0001 from './0001_light_cloak.sql';
import m0002 from './0002_rainy_grey_gargoyle.sql';
import m0003 from './0003_hot_brother_voodoo.sql';
import m0004 from './0004_abnormal_satana.sql';
import m0005 from './0005_worried_silvermane.sql';

export default {
  journal,
  migrations: {
    m0000,
    m0001,
    m0002,
    m0003,
    m0004,
    m0005,
  },
};
