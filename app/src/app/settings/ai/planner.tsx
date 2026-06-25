import { spacing } from '@/hooks/useAppTheme';

import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { I18nManager, Platform, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useDispatch } from 'react-redux';
import IconButton from '@/components/presentation/foundation/gesture-wrappers/icon-button';
import { Appbar, TextInput, Tooltip } from 'react-native-paper';
import { useState } from 'react';
import { useAppSelector } from '@/store';
import {
  addMessage,
  initChat,
  restartChat,
  selectIsLoadingAiPlannerMessage,
  stopAiGenerator,
} from '@/store/ai-planner';
import { uuid } from '@/utils/uuid';
import { useScroll } from '@/hooks/useScrollListener';
import { useMountEffect } from '@/hooks/useMountEffect';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatBubble } from '@/components/presentation/ai-planner/chat-bubble';
import { ShareProgramButton } from '@/components/presentation/ai-planner/share-program-button';

export default function AiPlanner() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const messages = useAppSelector((x) => x.aiPlanner.plannerChat);
  const { handleScroll } = useScroll(true);
  const isLoadingResponse = useAppSelector(selectIsLoadingAiPlannerMessage);
  // The server told us this app is out of date; block further input until updated.
  const isOutOfDate = messages.some((x) => x.type === 'updateRequired');
  const insets = useSafeAreaInsets();
  const bottomInsetHeight = Platform.select({ ios: insets.bottom }) ?? 0;
  useMountEffect(() => {
    dispatch(initChat());
  });

  const [messageText, setMessageText] = useState('');
  const sendMessage = (message: string) => {
    if (!isLoadingResponse && !isOutOfDate && message) {
      setMessageText('');
      dispatch(
        addMessage({
          from: 'User',
          message,
          id: uuid(),
          type: 'messageResponse',
        }),
      );
    }
  };
  const reset = () => dispatch(restartChat());

  return (
    <KeyboardAvoidingView
      behavior={'translate-with-padding'}
      style={{ flex: 1, insetBlockEnd: bottomInsetHeight }}
    >
      <Stack.Screen
        options={{
          scrollEdgeEffects: { top: 'hidden' },
          headerBlurEffect: 'systemMaterial',
          title: t('ai.planner.title'),
          headerRight: () => (
            <Tooltip title={t('ai.restart_chat.button')}>
              <Appbar.Action icon={'replay'} onPress={reset}></Appbar.Action>
            </Tooltip>
          ),
        }}
      />
      <View style={{ flex: 1 }}>
        <FlatList
          onScroll={handleScroll}
          data={messages}
          inverted
          contentContainerStyle={{
            gap: spacing[0.5],
            paddingHorizontal: spacing.pageHorizontalMargin,
          }}
          keyExtractor={(x) => x.id}
          renderItem={({ item, index }) => {
            const messageBelow = messages[index - 1]; // visually below (next in inverted list)
            const messageAbove = messages[index + 1]; // visually above (previous in inverted list)
            const isLastMessage = index === 0; // In inverted list, index 0 is the last (newest) message

            return (
              <ChatBubble
                message={item}
                sameSenderBelow={messageBelow?.from === item.from}
                sameSenderAbove={messageAbove?.from === item.from}
                isLastMessage={isLastMessage}
              />
            );
          }}
        />
      </View>
      <View
        style={{
          paddingHorizontal: spacing.pageHorizontalMargin,
          paddingVertical: spacing[2],
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <ShareProgramButton disabled={isLoadingResponse || isOutOfDate} />

        <TextInput
          value={messageText}
          editable={!isOutOfDate}
          style={{
            flex: 1,
            borderRadius: 30,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
          }}
          onChangeText={setMessageText}
          multiline
          placeholder={t('ai.type_your_message.placeholder')}
          onSubmitEditing={(e) => setMessageText(e.nativeEvent.text + '\n')}
          submitBehavior="submit"
          returnKeyType="default"
          underlineStyle={{ display: 'none' }}
        />

        {isLoadingResponse && (
          <IconButton
            mode="outlined"
            icon={'stop'}
            size={35}
            onPress={() => dispatch(stopAiGenerator())}
          />
        )}

        <IconButton
          mode="contained"
          icon={'send'}
          size={35}
          disabled={isOutOfDate}
          mirrored={I18nManager.isRTL}
          onPress={() => sendMessage(messageText)}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
