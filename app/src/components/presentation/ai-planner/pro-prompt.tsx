import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useDispatch } from 'react-redux';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import { restartChat } from '@/store/ai-planner';
import LimitedHtml from '@/components/presentation/foundation/limited-html';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import Purchases, { PRODUCT_CATEGORY, PurchasesStoreProduct } from 'react-native-purchases';
import { setProToken } from '@/store/settings';
import { IndeterminateProgress } from '@/components/presentation/foundation/indeterminate-progress';

export function ProPrompt() {
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const upgrade = () => {
    const run = async () => {
      if (__DEV__) {
        dispatch(setProToken('test-web-auth-key-12345'));
        dispatch(restartChat());
        return;
      }
      const owned = await presentPaywall();
      if (owned) {
        const info = await Purchases.getCustomerInfo();
        dispatch(setProToken(info.originalAppUserId));
        dispatch(restartChat());
      }
    };
    run().catch(console.error);
  };
  return (
    <View style={{ gap: spacing[2] }}>
      <SurfaceText>{t('ai.upgrade_to_pro.button')}</SurfaceText>
      <SurfaceText>
        <LimitedHtml value={t('ai.upgrade_to_pro.explanation')} />
      </SurfaceText>
      <ProPrice />
      <Button style={{ alignSelf: 'flex-end' }} mode="contained" onPress={upgrade}>
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
      <View style={{ alignItems: 'center' }}>
        <IndeterminateProgress />
      </View>
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
