import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { PageAction, PageActionsProps } from '@/components/presentation/foundation/page-actions-props';
import {
  Button,
  ExtendedFloatingActionButton,
  HorizontalFloatingToolbar,
  Host,
  Icon,
  Row,
  Shape,
  Text,
  TextButton,
} from '@expo/ui/jetpack-compose';
import { View } from 'react-native';
import { useScroll } from '@/hooks/useScrollListener';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

const contentPadding = { start: 24, top: 16, end: 24, bottom: 16 };

export function PageActions({ primary, secondary = [], primaryKind = 'surface', accessory }: PageActionsProps) {
  const { colors } = useAppTheme();

  const label = (action: PageAction, color: string, iconSize: number) => (
    <Row horizontalArrangement={{ spacedBy: spacing[2] }} verticalAlignment="center">
      <Icon source={action.icon} size={iconSize} tint={color} />
      <Text>{action.label}</Text>
    </Row>
  );

  // A toolbar holding nothing but a FAB is an icon with no way to read its meaning, so a
  // lone surface action gets an extended FAB, which keeps its label alongside the icon.
  // A FAB shows its label as a Compose Text, which never reaches the accessibility tree, and the
  // extended one drops the label entirely once collapsed. Either way the icon is the only thing
  // left to name the button, so it carries the description.
  const primaryIcon = (
    <Icon source={primary.icon} size={24} tint={colors.onPrimaryContainer} contentDescription={primary.label} />
  );

  const surfaceActions = secondary.length ? (
    <HorizontalFloatingToolbar variant="standard">
      <HorizontalFloatingToolbar.FloatingActionButton onPress={primary.onPress}>
        {primaryIcon}
      </HorizontalFloatingToolbar.FloatingActionButton>
      {secondary.map((action) => (
        <TextButton key={action.label} onClick={action.onPress}>
          {label(action, colors.onSecondaryContainer, 20)}
        </TextButton>
      ))}
    </HorizontalFloatingToolbar>
  ) : (
    <ExtendedFloatingActionButton onClick={primary.onPress} expanded>
      <ExtendedFloatingActionButton.Icon>{primaryIcon}</ExtendedFloatingActionButton.Icon>
      <ExtendedFloatingActionButton.Text>
        <Text>{primary.label}</Text>
      </ExtendedFloatingActionButton.Text>
    </ExtendedFloatingActionButton>
  );

  return (
    <View
      style={{
        alignItems: 'flex-end',
        gap: spacing[2],
        paddingHorizontal: spacing.pageHorizontalMargin,
        paddingBottom: spacing[3],
      }}
    >
      <Host matchContents seedColor={colors.seedColor}>
        {primaryKind === 'surface' ? (
          surfaceActions
        ) : (
          <Row horizontalArrangement={{ spacedBy: spacing[2] }} verticalAlignment="center">
            {secondary.map((action) => (
              <TextButton key={action.label} onClick={action.onPress}>
                {label(action, colors.primary, 18)}
              </TextButton>
            ))}
            <Button onClick={primary.onPress} shape={Shape.Pill({})} contentPadding={contentPadding}>
              {label(primary, colors.onPrimary, 18)}
            </Button>
          </Row>
        )}
      </Host>
      {accessory && <View style={{ alignSelf: 'stretch' }}>{accessory}</View>}
    </View>
  );
}
