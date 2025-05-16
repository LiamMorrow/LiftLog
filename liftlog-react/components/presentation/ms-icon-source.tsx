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

// console.log(msAdd);

const x = {
  variant: 'outlined' as const,
  weight: 400 as const,
  xml: '<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M450-450H200v-60h250v-250h60v250h250v60H510v250h-60v-250Z"/></svg>',
};

import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

// const MaterialSymbols = {
//   add: msAdd,
// };

// Instead of keeping the map above we can just go

// import * as AllIcons from '@material-symbols-react-native/outlined-400';
// type AllIconsType = keyof typeof AllIcons;
// const icon = AllIcons[name]
// This would import all the icons into the bundle though

export function msIconSource(name: any) {
  return ({ size, color }: { size: number; color: string }) => {
    return <MsIcon icon={x} size={size} color={color} />;
    // return (
    //   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    //     <Svg height="100" width="100">
    //       <Circle cx="50" cy="50" r="40" fill="blue" />
    //     </Svg>
    //   </View>
    // );
  };
}
