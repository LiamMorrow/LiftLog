import journal from './meta/_journal.json';
import m0000 from './0000_tearful_reavers.sql';
import m0001 from './0001_searchable_table.sql';

export default {
  journal,
  migrations: {
    m0000,
    m0001
  }
}
