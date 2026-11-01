import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useDerivedState } from '@/hooks/useDerivedState';
import {
  DiffChange,
  ExerciseModification,
  filterDiff,
  getChangeDescription,
  getChangeLabelKey,
  SessionBlueprintDiff,
} from '@/models/blueprint-diff';
import { useTranslate } from '@tolgee/react';
import { useEffect } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/presentation/foundation/app-text';
import { NativeIcon } from '@/components/presentation/foundation/native-icon';
import { SegmentedGroup, SegmentListFormElement } from '@/components/presentation/foundation/segmented-list';
import CheckCircleIcon from '@expo/material-symbols/check_circle.xml';
import UncheckedIcon from '@expo/material-symbols/radio_button_unchecked.xml';
import { match } from 'ts-pattern';

interface SessionDiffViewProps {
  diff: SessionBlueprintDiff;
  onSelectedDiffChange: (selectedDiff: SessionBlueprintDiff) => void;
}

export default function SessionDiffView({ diff: fullDiff, onSelectedDiffChange }: SessionDiffViewProps) {
  const { t } = useTranslate();

  // Track selected change IDs internally - default to all selected
  const [selectedChangeIds, setSelectedChangeIds] = useDerivedState(
    fullDiff,
    (fd) => new Set(fd.allChanges.map((c) => c.id)),
  );

  // Compute the filtered diff based on selection
  const selectedDiff = filterDiff(fullDiff, selectedChangeIds);

  // Emit the selected diff when it changes
  useEffect(() => {
    onSelectedDiffChange(selectedDiff);
  }, [selectedDiff, onSelectedDiffChange]);

  const toggleChange = (changeId: string) => {
    setSelectedChangeIds((prev) => {
      const next = new Set(prev);
      if (next.has(changeId)) {
        next.delete(changeId);
      } else {
        next.add(changeId);
      }
      return next;
    });
  };

  if (!fullDiff.hasChanges) {
    return (
      <View style={{ padding: spacing[4] }}>
        <AppText variant="bodyLarge" style={{ textAlign: 'center' }}>
          {t('plan.diff.no_changes.body')}
        </AppText>
      </View>
    );
  }

  return (
    <View>
      {/* Session-level changes */}
      {fullDiff.sessionChanges.length > 0 && (
        <DiffSection title={t('plan.diff.section.session.title')}>
          {fullDiff.sessionChanges.map((change) => (
            <DiffChangeRow
              key={change.id}
              change={change}
              disabled={change.kind === 'sessionName'}
              selected={selectedChangeIds.has(change.id)}
              onToggle={() => toggleChange(change.id)}
            />
          ))}
        </DiffSection>
      )}

      {/* Added exercises */}
      {fullDiff.addedExercises.length > 0 && (
        <DiffSection title={t('plan.diff.section.added.title')}>
          {fullDiff.addedExercises.map((change) => (
            <DiffChangeRow
              key={change.id}
              change={change}
              selected={selectedChangeIds.has(change.id)}
              onToggle={() => toggleChange(change.id)}
              variant="added"
            />
          ))}
        </DiffSection>
      )}

      {/* Removed exercises */}
      {fullDiff.removedExercises.length > 0 && (
        <DiffSection title={t('plan.diff.section.removed.title')}>
          {fullDiff.removedExercises.map((change) => (
            <DiffChangeRow
              key={change.id}
              change={change}
              selected={selectedChangeIds.has(change.id)}
              onToggle={() => toggleChange(change.id)}
              variant="removed"
            />
          ))}
        </DiffSection>
      )}

      {/* Reordered exercises */}
      {fullDiff.reorderedExercises.length > 0 && (
        <DiffSection title={t('plan.diff.section.reordered.title')}>
          {fullDiff.reorderedExercises.map((change) => (
            <DiffChangeRow
              key={change.id}
              change={change}
              selected={selectedChangeIds.has(change.id)}
              onToggle={() => toggleChange(change.id)}
            />
          ))}
        </DiffSection>
      )}

      {/* Modified exercises */}
      {fullDiff.modifiedExercises.length > 0 && (
        <DiffSection title={t('plan.diff.section.modified.title')} grouped={false}>
          {fullDiff.modifiedExercises.map((mod) => (
            <ExerciseModificationGroup
              key={mod.exerciseName}
              modification={mod}
              selectedChangeIds={selectedChangeIds}
              onToggleChange={toggleChange}
            />
          ))}
        </DiffSection>
      )}
    </View>
  );
}

interface DiffSectionProps {
  title: string;
  grouped?: boolean;
  children: React.ReactNode;
}

function DiffSection({ title, grouped = true, children }: DiffSectionProps) {
  return (
    <View style={{ marginBlockEnd: spacing[4] }}>
      <View
        style={{
          paddingVertical: spacing[2],
        }}
      >
        <AppText variant="titleSmall">{title}</AppText>
      </View>
      {grouped ? <SegmentedGroup>{children}</SegmentedGroup> : <View style={{ gap: spacing[3] }}>{children}</View>}
    </View>
  );
}

interface DiffChangeRowProps {
  change: DiffChange;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
  variant?: 'added' | 'removed' | 'modified';
}

function DiffChangeRow({ change, selected, onToggle, disabled, variant }: DiffChangeRowProps) {
  const { t } = useTranslate();
  const theme = useAppTheme();

  const description = getChangeDescription(t, change);
  const label = getChangeLabelKey(change);

  const variantColor = match(variant)
    .with('added', () => theme.colors.tertiary)
    .with('removed', () => theme.colors.error)
    .otherwise(() => undefined);

  return (
    <SegmentListFormElement
      onPress={disabled ? undefined : onToggle}
      label={<AppText style={variantColor ? { color: variantColor } : undefined}>{t(label.key, label.params)}</AppText>}
      supportingText={description}
      style={disabled ? { opacity: 0.6 } : undefined}
      right={
        selected ? (
          <NativeIcon
            icon={CheckCircleIcon}
            systemImage="checkmark.circle.fill"
            size={24}
            color={theme.colors.primary}
          />
        ) : (
          <NativeIcon icon={UncheckedIcon} systemImage="circle" size={24} color={theme.colors.onSurfaceVariant} />
        )
      }
    />
  );
}

interface ExerciseModificationGroupProps {
  modification: ExerciseModification;
  selectedChangeIds: Set<string>;
  onToggleChange: (changeId: string) => void;
}

function ExerciseModificationGroup({
  modification,
  selectedChangeIds,
  onToggleChange,
}: ExerciseModificationGroupProps) {
  return (
    <View style={{ gap: spacing[2] }}>
      <AppText variant="labelLarge" color="onSurfaceVariant" style={{ paddingInlineStart: spacing[2] }}>
        {modification.exerciseName}
      </AppText>
      <SegmentedGroup>
        {modification.changes.map((change) => (
          <DiffChangeRow
            key={change.id}
            change={change}
            selected={selectedChangeIds.has(change.id)}
            onToggle={() => onToggleChange(change.id)}
          />
        ))}
      </SegmentedGroup>
    </View>
  );
}
