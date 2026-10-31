import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { ColorChoice, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { Card } from 'react-native-paper';

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
              <Card
                key={tile.key}
                mode="contained"
                style={[{ flex: 1 }, tile.gold && { backgroundColor: colors.goldContainer }]}
              >
                <View style={{ padding: spacing[3], gap: spacing[0.5] }}>
                  <SurfaceText font="text-xs" color={ink}>
                    {tile.label}
                  </SurfaceText>
                  {tile.value}
                  {tile.caption ? (
                    <SurfaceText font="text-xs" color={ink} numberOfLines={1}>
                      {tile.caption}
                    </SurfaceText>
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
    <SurfaceText
      font="text-2xl"
      weight="bold"
      color={props.color}
      numberOfLines={1}
      style={{ fontVariant: ['tabular-nums'] }}
    >
      {children}
      {suffix ? (
        <SurfaceText font="text-sm" weight="normal" color="onSurfaceVariant">
          {suffix}
        </SurfaceText>
      ) : null}
    </SurfaceText>
  );
}
