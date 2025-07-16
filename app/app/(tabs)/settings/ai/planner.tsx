import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';

import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { FlatList, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useDispatch } from 'react-redux';
import { Appbar, IconButton, TextInput } from 'react-native-paper';
import { Fragment, useState } from 'react';
import { useAppSelector } from '@/store';
import {
  addMessage,
  ChatMessage,
  restartChat,
  selectIsLoadingAiPlannerMessage,
  stopAiGenerator,
} from '@/store/ai-planner';
import Animated, { ZoomInLeft, ZoomInRight } from 'react-native-reanimated';
import { uuid } from '@/utils/uuid';
import { useScroll } from '@/hooks/useScollListener';
import SessionSummary from '@/components/presentation/session-summary';
import SessionSummaryTitle from '@/components/presentation/session-summary-title';

export default function AiPlanner() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const messages = useAppSelector((x) => x.aiPlanner.plannerChat);
  const { handleScroll } = useScroll(true);
  const isLoadingResponse = useAppSelector(selectIsLoadingAiPlannerMessage);

  const [messageText, setMessageText] = useState('');
  const sendMessage = (message: string) => {
    if (!isLoadingResponse && message) {
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
      style={{ flex: 1 }}
    >
      <Stack.Screen
        options={{
          title: t('AiPlanner'),
          headerRight: () => (
            <Appbar.Action icon={'replay'} onPress={reset}></Appbar.Action>
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
        ></FlatList>
      </View>
      <View
        style={{
          paddingHorizontal: spacing.pageHorizontalMargin,
          paddingVertical: spacing[2],
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TextInput
          value={messageText}
          style={{
            flex: 1,
            borderRadius: 30,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
          }}
          onChangeText={setMessageText}
          multiline
          placeholder={t('Type your message')}
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
          onPress={() => sendMessage(messageText)}
        />
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
        {message.type === 'messageResponse' ? (
          <SurfaceText color={isUser ? 'onPrimary' : 'onSurface'}>
            {message.message}
          </SurfaceText>
        ) : (
          <>
            <SurfaceText
              font="text-2xl"
              weight={'bold'}
              color={isUser ? 'onPrimary' : 'onSurface'}
            >
              {message.plan.name}
            </SurfaceText>
            <SurfaceText color={isUser ? 'onPrimary' : 'onSurface'}>
              {message.plan.description}
            </SurfaceText>
            {message.plan.sessions.map((s, i) => (
              <Fragment key={i}>
                <SessionSummaryTitle session={s.getEmptySession()} />
                <SessionSummary session={s.getEmptySession()} />
              </Fragment>
            ))}
          </>
        )}
      </Animated.View>
    </View>
  );
}
