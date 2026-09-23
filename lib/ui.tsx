import { Link } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Product } from '../data/catalog';
import { productImage } from '../data/images';
import { colors, formatPrice } from './theme';
import { useCart } from './cart';

export function Stars({ value, count }: { value?: number; count?: number }) {
  if (!value) return null;
  const full = Math.round(value);
  return (
    <Text style={{ color: colors.muted, fontSize: 12 }}>
      <Text style={{ color: colors.star }}>{'★'.repeat(full)}</Text>
      {'☆'.repeat(Math.max(0, 5 - full))} {value.toFixed(1)}
      {count ? ` (${count})` : ''}
    </Text>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const img = productImage(product.image);
  return (
    <Link href={`/product/${product.id}`} asChild>
      <Pressable style={styles.card}>
        {img ? <Image source={img} style={styles.image} resizeMode="cover" /> : <View style={styles.image} />}
        <View style={{ padding: 10, gap: 2 }}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          <Stars value={product.rating_value} count={product.rating_count} />
          <Text style={styles.price}>{formatPrice(product.price, product.currency)}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

export function CartLink() {
  const { count } = useCart();
  return (
    <Link href="/cart" asChild>
      <Pressable style={styles.cartLink} hitSlop={8}>
        <Text style={{ fontSize: 18 }}>🛍️</Text>
        {count > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        ) : null}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hair,
  },
  image: { width: '100%', aspectRatio: 1, backgroundColor: '#e9e9ec' },
  brand: { color: colors.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  name: { color: colors.ink, fontSize: 14, fontWeight: '600' },
  price: { color: colors.price, fontSize: 15, fontWeight: '700', marginTop: 2 },
  cartLink: { paddingHorizontal: 6, paddingVertical: 4 },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: colors.accentInk, fontSize: 11, fontWeight: '700' },
});
