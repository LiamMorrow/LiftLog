// plate-calculator.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import BigNumber from 'bignumber.js';
import {
  Divider,
  List,
  SegmentedButtons,
  Text,
  useTheme,
} from 'react-native-paper';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';

type PlateCalculatorProps = {
  /** current weight from the dialog (optional; used to seed state) */
  value?: BigNumber | undefined;
  /** notify parent (the dialog) whenever the calculated total changes */
  onChange: (w: BigNumber) => void;
  /** "lb" | "kg" — whatever your useWeightSuffix() returns */
  unitSuffix?: string;

  /** override available plate sizes (numbers only, e.g., [45,35,25,10,5,2.5]) */
  plateOptions?: number[];

  /** override bar choices shown in segmented control */
  bars?: { label: string; weight: number }[];

  /** collapsible behavior */
  collapsible?: boolean; // default true
  defaultOpen?: boolean; // default false
  title?: string; // default "Plate calculator"
};

/** helper: sensible defaults by unit */
const defaultsForUnit = (unitSuffix?: string) => {
  const isKg = (unitSuffix ?? '').toLowerCase().startsWith('kg');
  return {
    plateOptions: isKg
      ? [25, 20, 15, 10, 5, 2.5, 1.25]
      : [45, 35, 25, 10, 5, 2.5],
    bars: isKg
      ? [
          { label: 'Standard (20)', weight: 20 },
          { label: 'Technique (15)', weight: 15 },
        ]
      : [
          { label: 'Standard (45)', weight: 45 },
          { label: 'Short (33)', weight: 33 },
          { label: 'Technique (15)', weight: 15 },
        ],
  };
};

export default function PlateCalculator({
  value,
  onChange,
  unitSuffix,
  plateOptions,
  bars,
  collapsible = true,
  defaultOpen = false,
  title = 'Plate calculator',
}: PlateCalculatorProps) {
  const theme = useTheme();
  const d = useMemo(() => defaultsForUnit(unitSuffix), [unitSuffix]);

  // Collapsible
  const [open, setOpen] = useState(defaultOpen);

  // IMPORTANT: start with NO bar selected; only emit after user interaction
  const [barWeight, setBarWeight] = useState<number | null>(null);
  const [pairs, setPairs] = useState<Record<number, number>>({});
  const [dirty, setDirty] = useState(false); // becomes true after any user action

  const plates = useMemo(
    () => (plateOptions ?? d.plateOptions).slice().sort((a, b) => b - a),
    [plateOptions, d.plateOptions],
  );

  // If dialog already has a value, approximate internally once (do NOT emit)
  // Satisfies exhaustive-deps while ensuring it runs once.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    if (!value || value.isNaN()) return;

    const target = value.toNumber();
    const bs = (bars ?? d.bars).map((b) => b.weight);
    const inferred =
      bs
        .slice()
        .sort((a, b) => b - a)
        .find((b) => b <= target) ?? null;

    // Hydrate internal state WITHOUT marking dirty
    setBarWeight(inferred);

    if (inferred != null) {
      setBarWeight(inferred);
      const perSide = Math.max(0, (target - inferred) / 2);
      const next: Record<number, number> = {};
      let remain = perSide;
      for (const p of plates) {
        const count = Math.floor(remain / p + 1e-6);
        if (count > 0) {
          next[p] = count;
          remain -= count * p;
        }
      }
      setPairs(next);
    }
  }, [value, bars, d.bars, plates]);

  // Compute total; when no bar selected yet, treat bar as 0
  const totalWeight = useMemo(() => {
    const plateTotal = Object.entries(pairs).reduce(
      (acc, [k, v]) => acc + Number(k) * v * 2,
      0,
    );
    const selectedBar = barWeight ?? 0;
    return new BigNumber(selectedBar + plateTotal);
  }, [pairs, barWeight]);

  // Only push changes up after user interacts
  useEffect(() => {
    if (dirty) onChange(totalWeight);
  }, [totalWeight, dirty, onChange]);

  // User actions
  const onSelectBar = (v: string) => {
    const n = Number(v);
    if (!isNaN(n)) {
      setBarWeight(n);
      setDirty(true);
    }
  };
  const inc = (p: number) => {
    setPairs((old) => ({ ...old, [p]: Math.max(0, (old[p] ?? 0) + 1) }));
    setDirty(true);
  };
  const dec = (p: number) => {
    setPairs((old) => ({ ...old, [p]: Math.max(0, (old[p] ?? 0) - 1) }));
    setDirty(true);
  };
  const clearAll = () => {
    setPairs({});
    setDirty(true);
  };

  const headerDescription =
    `${barWeight == null ? 'No bar selected' : `Bar ${barWeight}${unitSuffix ?? ''}`} • ` +
    `Target ${totalWeight.toFixed()}${unitSuffix ?? ''}`;

  const Content = (
    <View style={{ gap: 12, paddingTop: 4 }}>
      {/* Bar selector with explicit label */}
      <View
        style={{
          padding: 8,
          borderRadius: 8,
          backgroundColor: theme.colors.elevation.level1,
          gap: 6,
        }}
      >
        <Text variant="labelLarge">Bar</Text>
        <SegmentedButtons
          value={barWeight == null ? '' : String(barWeight)}
          onValueChange={onSelectBar}
          buttons={(bars ?? d.bars).map((b) => ({
            label: b.label,
            value: String(b.weight),
          }))}
        />
      </View>

      {/* Plates */}
      <View style={{ gap: 8 }}>
        {plates.map((p) => (
          <View
            key={p}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ opacity: 0.9 }}>
              {p} {unitSuffix} × 2
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconButton
                icon="minus"
                mode="outlined"
                size={18}
                onPress={() => dec(p)}
              />
              <Text style={{ minWidth: 28, textAlign: 'center' }}>
                {pairs[p] ?? 0}
              </Text>
              <IconButton
                icon="plus"
                mode="outlined"
                size={18}
                onPress={() => inc(p)}
              />
            </View>
          </View>
        ))}
      </View>

      <Divider />

      {/* Summary / actions */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text variant="titleSmall" style={{ opacity: 0.8 }}>
          Target: {totalWeight.toFixed()} {unitSuffix}
        </Text>
        <IconButton
          icon="delete"
          mode="contained-tonal"
          onPress={clearAll}
          accessibilityLabel="Clear plates"
        />
      </View>

      <Text style={{ opacity: 0.7 }}>
        Per side:{' '}
        {(() => {
          const selectedBar = barWeight ?? 0;
          const perSide = (totalWeight.toNumber() - selectedBar) / 2;
          if (perSide <= 0) return `0 ${unitSuffix}`;
          const breakdown = plates
            .map((p) => {
              const c = pairs[p] ?? 0;
              return c > 0 ? `${c}×${p}` : null;
            })
            .filter(Boolean)
            .join(', ');
          return `${perSide}${unitSuffix} (${breakdown})`;
        })()}
      </Text>
    </View>
  );

  if (!collapsible) {
    return (
      <View style={{ marginTop: 8 }}>
        <Text variant="titleMedium" style={{ marginBottom: 8 }}>
          {title}
        </Text>
        {Content}
      </View>
    );
  }

  return (
    <List.Section style={{ marginTop: 8 }}>
      <List.Accordion
        title={title}
        description={headerDescription}
        expanded={open}
        onPress={() => setOpen((v) => !v)}
        left={(props) => <List.Icon {...props} icon="dumbbell" />}
      >
        <View style={{ paddingHorizontal: 8, paddingBottom: 8 }}>
          {Content}
        </View>
      </List.Accordion>
    </List.Section>
  );
}
