import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useCart } from '../lib/cart';
import { colors, formatPrice } from '../lib/theme';
import { tracking, trackPurchase } from '../lib/tracking';

function newOrderId(): string {
  return 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 1000);
}

export default function CheckoutScreen() {
  const { lines, total, clear } = useCart();
  const router = useRouter();
  const [name, setName] = useState('Test Shopper');
  const [email, setEmail] = useState('test.shopper@example.com');

  const placeOrder = () => {
    const orderId = newOrderId();
    if (email) tracking.setUserId(email);
    trackPurchase(lines, orderId);
    clear();
    router.replace({ pathname: '/thank-you', params: { orderId, total: String(total) } });
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Stack.Screen options={{ title: 'Checkout' }} />
      <Text style={styles.label}>Full name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <View style={styles.summary}>
        <Text style={{ color: colors.muted }}>{lines.length} items</Text>
        <Text style={{ fontWeight: '800', fontSize: 18, color: colors.ink }}>{formatPrice(total)}</Text>
      </View>

      <Pressable style={styles.payBtn} onPress={placeOrder} disabled={!lines.length}>
        <Text style={styles.payText}>Place order (test)</Text>
      </Pressable>
      <Text style={styles.note}>
        No real payment. Placing the order fires a canonical `purchase` event to every active MMP.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.ink, fontWeight: '700', fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: colors.hair,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hair,
  },
  payBtn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  payText: { color: colors.accentInk, fontWeight: '800', fontSize: 16 },
  note: { color: colors.muted, fontSize: 12, textAlign: 'center' },
});
