import { spacing, useAppTheme } from '@/hooks/useAppTheme';

import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Dimensions, FlatList, I18nManager, Platform, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import { useDispatch } from 'react-redux';
import IconButton from '@/components/presentation/foundation/gesture-wrappers/icon-button';
import { Appbar, TextInput, Tooltip } from 'react-native-paper';
import { useAppSelector } from '@/store';
import {
  addMessage,
  ChatMessage,
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

const COMPOSER_GAP = spacing[2];

export default function AiPlanner() {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const dispatch = useDispatch();
  const messages = useAppSelector((x) => x.aiPlanner.plannerChat);
  const { handleScroll } = useScroll(true);
  const isLoadingResponse = useAppSelector(selectIsLoadingAiPlannerMessage);
  // The server told us this app is out of date; block further input until updated.
  const isOutOfDate = messages.some((x) => x.type === 'updateRequired');
  const baseInsets = useSafeAreaInsets();
  const insets = { ...baseInsets, bottom: Platform.select({ ios: baseInsets.bottom }) ?? 0 };
  const keyboard = useReanimatedKeyboardAnimation();
  // Distance from the composer's resting input to the physical screen bottom. On iOS the chat sits
  // under the translucent tab bar, so this is just the safe area; on Android the native tab bar
  // pushes it up, so it also includes that band. The keyboard height is measured from the physical
  // bottom, so we slide the whole chat up by only (keyboardHeight - restGap) to land the composer
  // on the keyboard rather than overshooting past it.
  const [restGap, setRestGap] = useState(0);
  const composerRef = useRef<View>(null);
  const listRef = useRef<FlatList>(null);
  const onComposerLayout = useCallback(() => {
    composerRef.current?.measureInWindow((_x, y, _width, height) => {
      // measureInWindow gives the composer's outer bottom; the input sits above it by the
      // composer's own bottom padding, so add that back to land the input on the keyboard.
      // The composer's resting bottom never moves (multiline growth extends it upward), and
      // measuring while the chat is translated for the keyboard would be wrong, so freeze the
      // first (at-rest) measurement.
      const bottomGap = Math.max(0, Dimensions.get('screen').height - (y + height));
      setRestGap((prev) => prev || bottomGap + insets.bottom + COMPOSER_GAP);
    });
  }, [insets.bottom]);

  const chatStyle = useAnimatedStyle(
    () => ({
      flex: 1,
      transform: [{ translateY: Math.min(0, keyboard.height.value + restGap) }],
    }),
    [restGap],
  );

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
    <View style={{ flex: 1, overflow: 'hidden', paddingLeft: insets.left, paddingRight: insets.right }}>
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
      <Animated.View style={chatStyle}>
        <FlatList<ChatMessage>
          ref={listRef}
          style={{ flex: 1 }}
          onScroll={handleScroll}
          keyboardDismissMode="interactive"
          automaticallyAdjustContentInsets={false}
          contentInsetAdjustmentBehavior="never"
          onContentSizeChange={() => listRef.current?.scrollToOffset({ offset: 0, animated: false })}
          data={messages}
          inverted
          contentContainerStyle={{
            gap: spacing[0.5],
            paddingHorizontal: spacing.pageHorizontalMargin,
            paddingTop: COMPOSER_GAP,
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
        <View
          ref={composerRef}
          collapsable={false}
          onLayout={onComposerLayout}
          style={{
            backgroundColor: colors.surface,
            paddingHorizontal: spacing.pageHorizontalMargin,
            paddingTop: COMPOSER_GAP,
            paddingBottom: insets.bottom + COMPOSER_GAP,
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
            <IconButton mode="outlined" icon={'stop'} size={35} onPress={() => dispatch(stopAiGenerator())} />
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
      </Animated.View>
    </View>
  );
}
