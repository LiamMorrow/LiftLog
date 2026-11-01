import { AppText } from '@/components/presentation/foundation/app-text';
import { Card } from '@/components/presentation/foundation/card';
import { ColorChoice, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { View } from 'react-native';

export interface StatTile {
  key: string;
  label: string;
  value: ReactNode;
  caption?: string | undefined;
  gold?: boolean;
}

export function StatTiles({ tiles }: { tiles: StatTile[] }) {
  const { colors } = useAppTheme();
  const columns = tiles.length === 4 ? 2 : tiles.length;
  const rows = Array.from({ length: Math.ceil(tiles.length / columns) }, (_, index) =>
    tiles.slice(index * columns, (index + 1) * columns),
  );

  return (
    <View style={{ gap: spacing[2] }}>
      {rows.map((row, index) => (
        <View key={index} style={{ flexDirection: 'row', gap: spacing[2] }}>
          {row.map((tile) => {
            const ink = tile.gold ? 'onGoldContainer' : 'onSurfaceVariant';
            return (
              <Card key={tile.key} style={[{ flex: 1 }, tile.gold && { backgroundColor: colors.goldContainer }]}>
                <View style={{ padding: spacing[3], gap: spacing[0.5] }}>
                  <AppText variant="bodySmall" color={ink}>
                    {tile.label}
                  </AppText>
                  {tile.value}
                  {tile.caption ? (
                    <AppText variant="bodySmall" color={ink} numberOfLines={1}>
                      {tile.caption}
                    </AppText>
                  ) : null}
                </View>
              </Card>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function StatValue(props: { children: ReactNode; suffix?: string | undefined; color?: ColorChoice }) {
  const { children, suffix } = props;
  return (
    <AppText variant="headlineSmall" color={props.color} numberOfLines={1} style={{ fontVariant: ['tabular-nums'] }}>
      {children}
      {suffix ? (
        <AppText variant="bodyMedium" color="onSurfaceVariant">
          {suffix}
        </AppText>
      ) : null}
    </AppText>
  );
}
