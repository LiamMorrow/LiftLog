import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';

import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { FlatList, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useDispatch } from 'react-redux';
import { IconButton, Searchbar } from 'react-native-paper';
import { useState } from 'react';
import { useAppSelector } from '@/store';
import { addMessage, ChatMessage } from '@/store/ai-planner';
import Animated, { ZoomInLeft, ZoomInRight } from 'react-native-reanimated';
import { uuid } from '@/utils/uuid';
import { useScroll } from '@/hooks/useScollListener';

export default function AiPlanner() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const messages = useAppSelector((x) => x.aiPlanner.plannerChat);
  const { handleScroll } = useScroll(true);

  const [messageText, setMessageText] = useState('');
  const sendMessage = (message: string) => {
    setMessageText('');
    dispatch(addMessage({ from: 'User', message, id: uuid() }));
  };

  return (
    <KeyboardAvoidingView
      behavior={'translate-with-padding'}
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ title: t('AiPlanner') }} />
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
        ></FlatList>
      </View>
      <View
        style={{
          paddingHorizontal: spacing.pageHorizontalMargin,
          paddingVertical: spacing[2],
        }}
      >
        <Searchbar
          value={messageText}
          onChangeText={setMessageText}
          right={(props) => (
            <IconButton
              icon={'send'}
              onPress={() => sendMessage(messageText)}
              {...props}
            />
          )}
          icon={'promptSuggestion'}
          placeholder={t('Type your message')}
          onSubmitEditing={(e) => sendMessage(e.nativeEvent.text)}
          submitBehavior="submit"
        ></Searchbar>
      </View>
    </KeyboardAvoidingView>
  );
}

function ChatBubble(props: {
  message: ChatMessage;
  sameSenderBelow: boolean;
  sameSenderAbove: boolean;
  isLastMessage: boolean;
}) {
  const { message, sameSenderBelow, sameSenderAbove, isLastMessage } = props;
  const isUser = message.from === 'User';
  const { colors } = useAppTheme();

  const smallRadius = spacing[1];
  const normalRadius = spacing[4];

  const topDynamicRadius = sameSenderAbove ? smallRadius : normalRadius;
  const bottomDynamicRadius = sameSenderBelow ? smallRadius : normalRadius;
  const zoom = isUser ? ZoomInRight : ZoomInLeft;
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: message.from === 'User' ? 'flex-end' : 'flex-start',
      }}
    >
      <Animated.View
        entering={
          isLastMessage
            ? zoom.duration(400).springify().damping(18).stiffness(150)
            : undefined!
        }
        style={{
          backgroundColor: isUser
            ? colors.primary
            : colors.surfaceContainerHighest,
          borderTopLeftRadius: isUser ? normalRadius : topDynamicRadius,
          borderTopRightRadius: isUser ? topDynamicRadius : normalRadius,
          borderBottomLeftRadius: isUser ? normalRadius : bottomDynamicRadius,
          borderBottomRightRadius: isUser ? bottomDynamicRadius : normalRadius,
          padding: spacing[3],
          maxWidth: '90%',
        }}
      >
        <SurfaceText color={isUser ? 'onPrimary' : 'onSurface'}>
          {message.message}
        </SurfaceText>
      </Animated.View>
    </View>
  );
}
