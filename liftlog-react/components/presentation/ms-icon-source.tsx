import {
  msAdd,
  msArrowDownward,
  msArrowUpward,
  msAssignment,
  msBugReport,
  msClose,
  msContentCopy,
  msDelete,
  msEdit,
  msFitnessCenter,
  msHistory,
  msInfo,
  msMoreHoriz,
  msNotes,
  msNotifications,
  msRemove,
  msSave,
  msSettings,
  msSettingsBackupRestore,
  msShare,
  msStar,
  msTextAd,
  msTranslate,
  msWeight,
} from '@material-symbols-react-native/outlined-400'; // Using the default weight (400)

import { MsIcon } from 'material-symbols-react-native';

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

// Instead of keeping the map above we can just go

// import * as AllIcons from '@material-symbols-react-native/outlined-400';
// type AllIconsType = keyof typeof AllIcons;
// const icon = AllIcons[name]
// This would import all the icons into the bundle though

export function msIconSource(name: keyof typeof MaterialSymbols) {
  return ({ size, color }: { size: number; color: string }) => {
    const icon = MaterialSymbols[name];
    if (!icon) {
      throw new Error(`Icon "${name}" not found in MaterialSymbols Map.`);
    }
    return <MsIcon icon={MaterialSymbols[name]} size={size} color={color} />;
  };
}
