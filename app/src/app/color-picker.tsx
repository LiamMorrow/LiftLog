import { ColorPicker } from '@/components/presentation/foundation/editors/color-picker';
import { useRouteEditorSession } from '@/hooks/useRouteEditor';
import { ColorSchemeSeed } from '@/store/settings';
import { HexColor } from '@/utils/color';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ColorPickerPage() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const { dismiss } = useRouter();
  const { input, send } = useRouteEditorSession<ColorSchemeSeed, HexColor>(requestId);
  if (!input) {
    return null;
  }
  return (
    <ColorPicker
      initialSeed={input}
      onSave={(seed) => {
        send(seed);
        dismiss();
      }}
    />
  );
}
