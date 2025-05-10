import { MaterialSwitch } from '@/components/presentation/material-switch';
import { ReactNode, useEffect, useState } from 'react';
import { NativeSyntheticEvent, Platform, ViewStyle } from 'react-native';
import { List, Switch } from 'react-native-paper';

interface ListSwitchProps {
  headline: ReactNode;
  supportingText: ReactNode;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export default function ListSwitch(props: ListSwitchProps) {
  return (
    <List.Item
      title={props.headline}
      description={props.supportingText}
      onPress={() => props.onValueChange(!props.value)}
      right={(e) => (
        <MaterialSwitch
          value={props.value}
          onChange={(e) => props.onValueChange(e.nativeEvent.value)}
          style={[e.style, { width: 60, height: 30, alignSelf: 'center' }]}
        />
      )}
    />
  );
}
