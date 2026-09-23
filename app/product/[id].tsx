import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getProduct } from '../../data/catalog';
import { productImage } from '../../data/images';
import { useCart } from '../../lib/cart';
import { colors, formatPrice } from '../../lib/theme';
import { trackAddToCart, trackViewItem } from '../../lib/tracking';
import { CartLink, Stars } from '../../lib/ui';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = getProduct(id ?? '');
  const router = useRouter();
  const { add } = useCart();
  const [variantIdx, setVariantIdx] = useState(0);

  useEffect(() => {
    if (product) trackViewItem(product);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const variant = product?.variants[variantIdx];
  const img = useMemo(() => productImage(variant?.image ?? product?.image), [variant, product]);

  if (!product || !variant) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.muted }}>Product not found.</Text>
      </View>
    );
  }

  const onAdd = () => {
    add(product, variant, 1);
    trackAddToCart(product, 1);
    router.push('/cart');
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: product.brand, headerRight: () => <CartLink /> }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {img ? <Image source={img} style={styles.hero} resizeMode="cover" /> : <View style={styles.hero} />}
        <View style={{ padding: 16, gap: 8 }}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Stars value={product.rating_value} count={product.rating_count} />
          <Text style={styles.price}>{formatPrice(variant.price, product.currency)}</Text>

          <Text style={styles.label}>Variant</Text>
          <View style={styles.variantRow}>
            {product.variants.map((v, i) => (
              <Pressable
                key={v.sku}
                onPress={() => setVariantIdx(i)}
                style={[styles.variantChip, i === variantIdx && styles.variantChipActive]}
              >
                <Text style={[styles.variantText, i === variantIdx && styles.variantTextActive]}>
                  {v.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Details</Text>
          <Text style={styles.desc}>{product.description}</Text>
          <Text style={styles.meta}>Material: {product.material}</Text>
          <Text style={styles.meta}>SKU: {variant.sku}</Text>
          <Text style={styles.meta}>
            {variant.quantity > 0 ? `In stock (${variant.quantity})` : 'Out of stock'}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.addBtn} onPress={onAdd}>
          <Text style={styles.addBtnText}>Add to cart · {formatPrice(variant.price, product.currency)}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', aspectRatio: 1, backgroundColor: '#e9e9ec' },
  brand: { color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 12 },
  name: { color: colors.ink, fontSize: 22, fontWeight: '800' },
  price: { color: colors.price, fontSize: 20, fontWeight: '800', marginTop: 2 },
  label: { color: colors.ink, fontWeight: '700', marginTop: 12, fontSize: 14 },
  variantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  variantChip: {
    borderWidth: 1,
    borderColor: colors.hair,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
  },
  variantChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  variantText: { color: colors.ink, fontWeight: '600', fontSize: 13 },
  variantTextActive: { color: colors.accentInk },
  desc: { color: colors.muted, lineHeight: 20 },
  meta: { color: colors.muted, fontSize: 13 },
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
  addBtn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addBtnText: { color: colors.accentInk, fontWeight: '800', fontSize: 16 },
});
