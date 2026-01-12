import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';

import { T, useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import { I18nManager, Platform, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useDispatch } from 'react-redux';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';
import Button from '@/components/presentation/gesture-wrappers/button';
import {
  Appbar,
  TextInput,
  ActivityIndicator,
  Tooltip,
} from 'react-native-paper';
import { Fragment, useEffect, useState } from 'react';
import { useAppSelector } from '@/store';
import {
  addMessage,
  ChatMessage,
  initChat,
  restartChat,
  selectIsLoadingAiPlannerMessage,
  stopAiGenerator,
} from '@/store/ai-planner';
import Animated, {
  ZoomIn,
  ZoomInLeft,
  ZoomInRight,
} from 'react-native-reanimated';
import { uuid } from '@/utils/uuid';
import { useScroll } from '@/hooks/useScrollListener';
import SessionSummary from '@/components/presentation/session-summary';
import SessionSummaryTitle from '@/components/presentation/session-summary-title';
import { AiChatMessageResponse, AiChatPlanResponse } from '@/models/ai-models';
import { savePlan } from '@/store/program';
import { ProgramBlueprint } from '@/models/blueprint-models';
import { LocalDate } from '@js-joda/core';
import { match } from 'ts-pattern';
import LimitedHtml from '@/components/presentation/limited-html';
import { useMountEffect } from '@/hooks/useMountEffect';

import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import Purchases, {
  PRODUCT_CATEGORY,
  PurchasesStoreProduct,
} from 'react-native-purchases';
import { setProToken } from '@/store/settings';
import { Session } from '@/models/session-models';
import { usePreferredWeightUnit } from '@/hooks/usePreferredWeightUnit';

export default function AiPlanner() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const messages = useAppSelector((x) => x.aiPlanner.plannerChat);
  const { handleScroll } = useScroll(true);
  const isLoadingResponse = useAppSelector(selectIsLoadingAiPlannerMessage);
  useMountEffect(() => {
    dispatch(initChat());
  });

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
          mirrored={I18nManager.isRTL}
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
            ? zoom.springify().damping(18).stiffness(150).duration(400)
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
        {match(message)
          .with({ type: 'messageResponse' }, (message) => (
            <GeneralMessage isUser={isUser} message={message} />
          ))
          .with({ type: 'chatPlan' }, (message) => (
            <PlanMessage isUser={isUser} message={message} />
          ))
          .with({ type: 'purchasePro' }, () => <ProPrompt />)
          .exhaustive()}
      </Animated.View>
    </View>
  );
}

function GeneralMessage({
  message,
  isUser,
}: {
  message: AiChatMessageResponse;
  isUser: boolean;
}) {
  return (
    <SurfaceText color={isUser ? 'onPrimary' : 'onSurface'}>
      {message.message}
    </SurfaceText>
  );
}

function PlanMessage({
  message,
  isUser,
}: {
  message: AiChatPlanResponse & ChatMessage;
  isUser: boolean;
}) {
  const dispatch = useDispatch();
  const { push } = useRouter();
  const preferredWeightUnit = usePreferredWeightUnit();
  const saveAiPlan = (m: AiChatPlanResponse) => {
    const programId = uuid();
    dispatch(
      savePlan({
        programId,
        programBlueprint: ProgramBlueprint.fromPOJO({
          lastEdited: LocalDate.now(),
          name: m.plan.name,
          sessions: m.plan.sessions.map((x) => x.toPOJO()),
        }),
      }),
    );
    push(`/(tabs)/settings/program-list?focusprogramId=${programId}`);
  };
  return (
    <View style={{ gap: spacing[2] }}>
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
          <SessionSummaryTitle
            session={Session.getEmptySession(s, preferredWeightUnit)}
          />
          <SessionSummary
            session={Session.getEmptySession(s, preferredWeightUnit)}
          />
        </Fragment>
      ))}
      {!message.isLoading && (
        <Animated.View
          entering={ZoomIn.springify().duration(150)}
          style={{ alignSelf: 'flex-end' }}
        >
          <Button
            mode="contained"
            icon={'assignmentAdd'}
            onPress={() => saveAiPlan(message)}
          >
            <T keyName="plan.save_new.button" />
          </Button>
        </Animated.View>
      )}
    </View>
  );
}

function ProPrompt() {
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const upgrade = () => {
    const run = async () => {
      const owned = await presentPaywall();
      if (owned) {
        const info = await Purchases.getCustomerInfo();
        dispatch(setProToken(info.originalAppUserId));
        dispatch(restartChat());
      }
    };
    run().catch(console.error);
  };
  if (Platform.OS === 'web') {
    return (
      <SurfaceText>
        Unfortunately the AI planner is not available on the web version. Please
        download LiftLog for iOS or Android.
      </SurfaceText>
    );
  }
  return (
    <View style={{ gap: spacing[2] }}>
      <SurfaceText>{t('ai.upgrade_to_pro.button')}</SurfaceText>
      <SurfaceText>
        <LimitedHtml value={t('ai.upgrade_to_pro.explanation')} /> <ProPrice />
      </SurfaceText>
      <Button
        style={{ alignSelf: 'flex-end' }}
        mode="contained"
        onPress={upgrade}
      >
        {t('generic.upgrade.button')}
      </Button>
    </View>
  );
}

function ProPrice() {
  const [product, setProduct] = useState<PurchasesStoreProduct>();

  useEffect(() => {
    Purchases.getProducts(['pro'], PRODUCT_CATEGORY.NON_SUBSCRIPTION)
      .then((v) => {
        setProduct(v[0]);
      })
      .catch(console.error);
  }, []);
  if (!product) {
    return (
      <SurfaceText>
        <ActivityIndicator />
      </SurfaceText>
    );
  }

  return <SurfaceText>{product.priceString}</SurfaceText>;
}

async function presentPaywall(): Promise<boolean> {
  const customer = await Purchases.getCustomerInfo();
  if (customer.entitlements.active['pro']) {
    return true;
  }
  try {
    const restore = await Purchases.restorePurchases();
    if (restore.entitlements.active['pro']) {
      return true;
    }
  } catch (err) {
    console.log('Failed to restore purchases', err, customer.originalAppUserId);
  }
  // Present paywall for current offering:
  const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();

  switch (paywallResult) {
    case PAYWALL_RESULT.NOT_PRESENTED:
    case PAYWALL_RESULT.ERROR:
    case PAYWALL_RESULT.CANCELLED:
      return false;
    case PAYWALL_RESULT.PURCHASED:
    case PAYWALL_RESULT.RESTORED:
      return true;
    default:
      return false;
  }
}
