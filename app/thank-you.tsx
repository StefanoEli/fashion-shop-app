import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, formatPrice } from '../lib/theme';

export default function ThankYouScreen() {
  const { orderId, total } = useLocalSearchParams<{ orderId: string; total: string }>();
  return (
    <View style={styles.wrap}>
      <Stack.Screen options={{ title: 'Order confirmed', headerBackVisible: false }} />
      <Text style={{ fontSize: 52 }}>✅</Text>
      <Text style={styles.title}>Thank you!</Text>
      <Text style={styles.sub}>Your order has been placed.</Text>
      <View style={styles.card}>
        <Row label="Order" value={orderId ?? '—'} />
        <Row label="Total" value={total ? formatPrice(Number(total)) : '—'} />
      </View>
      <Link href="/" asChild>
        <Pressable style={styles.btn}>
          <Text style={styles.btnText}>Continue shopping</Text>
        </Pressable>
      </Link>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: colors.muted }}>{label}</Text>
      <Text style={{ color: colors.ink, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
  title: { fontSize: 26, fontWeight: '800', color: colors.ink },
  sub: { color: colors.muted },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 8,
    marginVertical: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hair,
  },
  btn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 28 },
  btnText: { color: colors.accentInk, fontWeight: '800', fontSize: 16 },
});
