import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { importPlanFromPicker } from '@/store/program';
import { T, useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { Linking, View } from 'react-native';
import { Card } from 'react-native-paper';
import { useDispatch } from 'react-redux';

const PLAN_FILE_DOCS_URL = 'https://github.com/LiamMorrow/LiftLog/blob/main/docs/PlanFileFormat.md';

export default function ImportPlanInfoPage() {
  const { t } = useTranslate();
  const dispatch = useDispatch();

  const openUrl = (url: string) => {
    void Linking.canOpenURL(url).then(() => Linking.openURL(url));
  };

  return (
    <FullHeightScrollView>
      <Stack.Screen options={{ title: t('plan.import.title') }} />
      <Card mode="contained" style={{ marginHorizontal: spacing[6], marginBottom: spacing[4] }}>
        <Card.Content>
          <View>
            <SurfaceText style={{ textAlign: 'center' }}>
              <T keyName="plan.import.explanation" />
            </SurfaceText>
          </View>
          <Button onPress={() => openUrl(PLAN_FILE_DOCS_URL)}>
            <T keyName="generic.read_documentation.button" />
          </Button>
        </Card.Content>
      </Card>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: spacing[4],
          margin: spacing[6],
        }}
      >
        <Button mode="contained" onPress={() => dispatch(importPlanFromPicker())}>
          <T keyName="plan.import.choose_file.button" />
        </Button>
      </View>
    </FullHeightScrollView>
  );
}
