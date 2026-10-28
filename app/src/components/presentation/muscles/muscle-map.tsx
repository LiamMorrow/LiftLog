import {
  muscleMapBack,
  muscleMapFace,
  muscleMapFigureHeight,
  muscleMapFigureWidth,
  muscleMapFront,
  MuscleMapRegion,
} from '@/components/presentation/muscles/muscle-map-paths';
import { useAppTheme } from '@/hooks/useAppTheme';
import { toKeySegment } from '@/utils/exercise-meta';
import { StyleProp, View, ViewStyle } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

const figureGap = 10;
const width = muscleMapFigureWidth * 2 + figureGap;

export function MuscleMap(props: { intensities: Partial<Record<string, number>>; style?: StyleProp<ViewStyle> }) {
  const { colors } = useAppTheme();
  const intensities = new Map(
    Object.entries(props.intensities).map(([muscle, intensity]) => [
      toKeySegment(muscle),
      Math.min(Math.max(intensity ?? 0, 0), 1),
    ]),
  );

  return (
    <View style={[{ width: '100%', aspectRatio: width / muscleMapFigureHeight }, props.style]}>
      <Svg viewBox={`0 0 ${width} ${muscleMapFigureHeight}`} width="100%" height="100%">
        <Figure regions={muscleMapFront} intensities={intensities} />
        {muscleMapFace.map((d) => (
          <Path key={d} d={d} fill={colors.surfaceContainerHighest} />
        ))}
        <G transform={`translate(${muscleMapFigureWidth + figureGap}, 0)`}>
          <Figure regions={muscleMapBack} intensities={intensities} />
        </G>
      </Svg>
    </View>
  );
}

function Figure({ regions, intensities }: { regions: MuscleMapRegion[]; intensities: Map<string, number> }) {
  return (
    <>
      {regions.map((region, index) => (
        <G key={index}>
          <Region region={region} intensity={region.muscle ? (intensities.get(region.muscle) ?? 0) : 0} />
          {region.mirror && (
            <G transform={`translate(${muscleMapFigureWidth}, 0) scale(-1, 1)`}>
              <Region region={region} intensity={region.muscle ? (intensities.get(region.muscle) ?? 0) : 0} />
            </G>
          )}
        </G>
      ))}
    </>
  );
}

function Region({ region, intensity }: { region: MuscleMapRegion; intensity: number }) {
  const { colors } = useAppTheme();
  return (
    <>
      <Path d={region.d} fill={region.tone === 'muscle' ? colors.surfaceContainerHighest : colors.outlineVariant} />
      {intensity > 0 && <Path d={region.d} fill={colors.primary} fillOpacity={intensity} />}
    </>
  );
}
