import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { FlatList, Text, View } from 'react-native';

import { productsByCategory } from '../../data/catalog';
import { colors } from '../../lib/theme';
import { trackViewItemList } from '../../lib/tracking';
import { CartLink, ProductCard } from '../../lib/ui';

export default function CategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const name = decodeURIComponent(category ?? '');
  const products = productsByCategory(name);

  useEffect(() => {
    if (products.length) trackViewItemList(name, products);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: name, headerRight: () => <CartLink /> }} />
      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        contentContainerStyle={{ gap: 12, paddingVertical: 16 }}
        ListHeaderComponent={
          <Text style={{ color: colors.muted, paddingHorizontal: 0, marginBottom: 4 }}>
            {products.length} products
          </Text>
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
