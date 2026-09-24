import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { CartProvider } from '../lib/cart';
import { colors } from '../lib/theme';
import { initTracking } from '../lib/tracking';

async function requestAttThenInit() {
  // On iOS, request App Tracking Transparency BEFORE starting the MMP SDKs so
  // they can pick up the IDFA when consent is granted. AppsFlyer is configured
  // to wait for the ATT decision (timeToWaitForATTUserAuthorization).
  if (Platform.OS === 'ios') {
    try {
      const { requestTrackingPermissionsAsync } = require('expo-tracking-transparency');
      await requestTrackingPermissionsAsync();
    } catch (e) {
      console.warn('[att] request failed', e);
    }
  }
  await initTracking();
}

export default function RootLayout() {
  useEffect(() => {
    requestAttThenInit();
  }, []);

  return (
    <SafeAreaProvider>
      <CartProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.ink,
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Fashion Shop' }} />
          <Stack.Screen name="category/[category]" options={{ title: 'Category' }} />
          <Stack.Screen name="product/[id]" options={{ title: 'Product' }} />
          <Stack.Screen name="cart" options={{ title: 'Cart' }} />
          <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
          <Stack.Screen name="thank-you" options={{ title: 'Order confirmed' }} />
          <Stack.Screen name="settings" options={{ title: 'Admin' }} />
        </Stack>
      </CartProvider>
    </SafeAreaProvider>
  );
}
