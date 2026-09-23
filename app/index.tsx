import { Link, Stack } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { CATEGORIES, PRODUCTS } from '../data/catalog';
import { colors } from '../lib/theme';
import { CartLink, ProductCard } from '../lib/ui';

const FEATURED = PRODUCTS.slice(0, 12);

export default function Home() {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerRight: () => <CartLink />,
          headerLeft: () => (
            <Link href="/settings" asChild>
              <Pressable hitSlop={8}>
                <Text style={{ fontSize: 18 }}>⚙️</Text>
              </Pressable>
            </Link>
          ),
        }}
      />
      <FlatList
        data={FEATURED}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 32 }}
        ListHeaderComponent={
          <View>
            <View style={styles.hero}>
              <Text style={styles.heroKicker}>NEW SEASON</Text>
              <Text style={styles.heroTitle}>Elevated everyday{'\n'}essentials</Text>
              <Text style={styles.heroSub}>Curated fashion — apparel, footwear & accessories.</Text>
            </View>
            <View style={styles.chips}>
              {CATEGORIES.map((c) => (
                <Link key={c} href={`/category/${encodeURIComponent(c)}`} asChild>
                  <Pressable style={styles.chip}>
                    <Text style={styles.chipText}>{c}</Text>
                  </Pressable>
                </Link>
              ))}
            </View>
            <Text style={styles.sectionTitle}>Featured</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <ProductCard product={item} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.ink,
    margin: 16,
    borderRadius: 18,
    padding: 22,
    gap: 6,
  },
  heroKicker: { color: '#cbd5e1', fontSize: 12, letterSpacing: 2, fontWeight: '700' },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800', lineHeight: 30 },
  heroSub: { color: '#cbd5e1', fontSize: 13, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.hair,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipText: { color: colors.ink, fontWeight: '600', fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.ink, paddingHorizontal: 16, marginBottom: 4 },
});
