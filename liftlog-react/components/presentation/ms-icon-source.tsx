import { msAdd } from '@material-symbols-react-native/outlined-400/msAdd';
import { msArrowDownward } from '@material-symbols-react-native/outlined-400/msArrowDownward';
import { msArrowUpward } from '@material-symbols-react-native/outlined-400/msArrowUpward';
import { msAssignment } from '@material-symbols-react-native/outlined-400/msAssignment';
import { msBugReport } from '@material-symbols-react-native/outlined-400/msBugReport';
import { msClose } from '@material-symbols-react-native/outlined-400/msClose';
import { msContentCopy } from '@material-symbols-react-native/outlined-400/msContentCopy';
import { msDelete } from '@material-symbols-react-native/outlined-400/msDelete';
import { msEdit } from '@material-symbols-react-native/outlined-400/msEdit';
import { msFitnessCenter } from '@material-symbols-react-native/outlined-400/msFitnessCenter';
import { msHistory } from '@material-symbols-react-native/outlined-400/msHistory';
import { msInfo } from '@material-symbols-react-native/outlined-400/msInfo';
import { msMoreHoriz } from '@material-symbols-react-native/outlined-400/msMoreHoriz';
import { msNotes } from '@material-symbols-react-native/outlined-400/msNotes';
import { msNotifications } from '@material-symbols-react-native/outlined-400/msNotifications';
import { msRemove } from '@material-symbols-react-native/outlined-400/msRemove';
import { msSave } from '@material-symbols-react-native/outlined-400/msSave';
import { msSettings } from '@material-symbols-react-native/outlined-400/msSettings';
import { msSettingsBackupRestore } from '@material-symbols-react-native/outlined-400/msSettingsBackupRestore';
import { msShare } from '@material-symbols-react-native/outlined-400/msShare';
import { msStar } from '@material-symbols-react-native/outlined-400/msStar';
import { msTextAd } from '@material-symbols-react-native/outlined-400/msTextAd';
import { msTranslate } from '@material-symbols-react-native/outlined-400/msTranslate';
import { msWeight } from '@material-symbols-react-native/outlined-400/msWeight';
import { MsIcon } from 'material-symbols-react-native';

// Importing these icons using the below methods causes android app to crash
// import { msAdd, msArrowDownward } from '@material-symbols-react-native/outlined-400';
// import * as AllIcons from '@material-symbols-react-native/outlined-400';

const MaterialSymbols = {
  add: msAdd,
  arrowDownward: msArrowDownward,
  arrowUpward: msArrowUpward,
  assignment: msAssignment,
  bugReport: msBugReport,
  close: msClose,
  contentCopy: msContentCopy,
  delete: msDelete,
  edit: msEdit,
  history: msHistory,
  info: msInfo,
  minus: msRemove, // Remap
  moreHoriz: msMoreHoriz,
  notes: msNotes,
  notifications: msNotifications,
  plus: msAdd, // Remap
  remove: msRemove,
  save: msSave,
  settings: msSettings,
  settingsBackupRestore: msSettingsBackupRestore,
  share: msShare,
  star: msStar,
  text: msTextAd,
  translate: msTranslate,
  weight: msWeight,
  fitnessCenter: msFitnessCenter,
};

export function msIconSource(name: keyof typeof MaterialSymbols) {
  return ({ size, color }: { size: number; color: string }) => {
    const icon = MaterialSymbols[name];
    if (!icon) {
      throw new Error(`Icon "${name}" not found in MaterialSymbols Map.`);
    }
    return <MsIcon icon={MaterialSymbols[name]} size={size} color={color} />;
  };
}
