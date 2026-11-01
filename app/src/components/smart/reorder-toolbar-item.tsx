import { NativeButton } from '@/components/presentation/foundation/native-button';
import SwapVert from '@expo/material-symbols/swap_vert.xml';
import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export function useReorderToolbarItem(props: { reordering: boolean; onToggle: () => void; hidden?: boolean }) {
  const { t } = useTranslate();
  const doneLabel = t('generic.done.button');

  if (!props.reordering) {
    return (
      <Stack.Toolbar.Button
        key="reorder"
        hidden={props.hidden}
        accessibilityLabel={t('generic.reorder.button')}
        onPress={props.onToggle}
      >
        <Stack.Toolbar.Icon sf="arrow.up.arrow.down" {...(Platform.OS === 'ios' ? {} : { src: SwapVert })} />
      </Stack.Toolbar.Button>
    );
  }

  return Platform.OS === 'ios' ? (
    <Stack.Toolbar.Button key="reorder" onPress={props.onToggle}>
      <Stack.Toolbar.Label>{doneLabel}</Stack.Toolbar.Label>
    </Stack.Toolbar.Button>
  ) : (
    <Stack.Toolbar.View key="reorder">
      <NativeButton variant="text" compact label={doneLabel} onPress={props.onToggle} />
    </Stack.Toolbar.View>
  );
}
