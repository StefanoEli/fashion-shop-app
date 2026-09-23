import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { productImage } from '../data/images';
import { useCart } from '../lib/cart';
import { colors, formatPrice } from '../lib/theme';
import { trackBeginCheckout, trackViewCart } from '../lib/tracking';

export default function CartScreen() {
  const { lines, total, remove } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (lines.length) trackViewCart(lines);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCheckout = () => {
    trackBeginCheckout(lines);
    router.push('/checkout');
  };

  if (!lines.length) {
    return (
      <View style={styles.empty}>
        <Text style={{ fontSize: 40 }}>🛍️</Text>
        <Text style={{ color: colors.muted, marginTop: 8 }}>Your cart is empty.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Cart' }} />
      <FlatList
        data={lines}
        keyExtractor={(l) => l.sku}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 120 }}
        renderItem={({ item }) => {
          const img = productImage(item.product.image);
          return (
            <View style={styles.row}>
              {img ? <Image source={img} style={styles.thumb} /> : <View style={styles.thumb} />}
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.product.name}
                </Text>
                <Text style={styles.meta}>{item.sku}</Text>
                <Text style={styles.meta}>Qty {item.quantity}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Text style={styles.price}>{formatPrice(item.price * item.quantity)}</Text>
                <Pressable onPress={() => remove(item.sku)} hitSlop={8}>
                  <Text style={{ color: '#dc2626', fontSize: 12, fontWeight: '600' }}>Remove</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
      <View style={styles.footer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ color: colors.muted }}>Total</Text>
          <Text style={{ fontWeight: '800', fontSize: 18, color: colors.ink }}>{formatPrice(total)}</Text>
        </View>
        <Pressable style={styles.checkoutBtn} onPress={onCheckout}>
          <Text style={styles.checkoutText}>Checkout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hair,
  },
  thumb: { width: 64, height: 64, borderRadius: 10, backgroundColor: '#e9e9ec' },
  name: { color: colors.ink, fontWeight: '700' },
  meta: { color: colors.muted, fontSize: 12 },
  price: { color: colors.price, fontWeight: '800' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hair,
  },
  checkoutBtn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  checkoutText: { color: colors.accentInk, fontWeight: '800', fontSize: 16 },
});
