import { Stack } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PROVIDERS_CONFIG } from '../lib/tracking/config';
import { colors } from '../lib/theme';
import { tracking, type EventLogEntry } from '../lib/tracking';

export default function SettingsScreen() {
  const [log, setLog] = useState<EventLogEntry[]>(tracking.getLog());
  const active = tracking.activeProviders();

  useEffect(() => tracking.subscribe(setLog), []);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Stack.Screen options={{ title: 'Tracking inspector' }} />

      <Section title="Active MMP providers">
        {active.length ? (
          active.map((p) => (
            <Badge key={p} label={p} tone="ok" />
          ))
        ) : (
          <Text style={styles.muted}>
            No native MMP active. In Expo Go the SDKs are unavailable — events are logged only. Use a
            dev/EAS build to forward to AppsFlyer/Adjust.
          </Text>
        )}
      </Section>

      <Section title="Configuration">
        <KV k="AppsFlyer enabled" v={String(PROVIDERS_CONFIG.appsflyer.enabled)} />
        <KV k="AppsFlyer devKey" v={PROVIDERS_CONFIG.appsflyer.devKey ? 'set' : 'missing'} />
        <KV k="AppsFlyer appId (iOS)" v={PROVIDERS_CONFIG.appsflyer.appId || '—'} />
        <KV k="Adjust enabled" v={String(PROVIDERS_CONFIG.adjust.enabled)} />
        <KV k="Adjust env" v={PROVIDERS_CONFIG.adjust.environment} />
        <KV
          k="Adjust event tokens"
          v={String(Object.keys(PROVIDERS_CONFIG.adjust.eventTokens).length)}
        />
      </Section>

      <Section title={`Event log (${log.length})`}>
        {log.length === 0 ? (
          <Text style={styles.muted}>No events yet. Browse the shop to generate events.</Text>
        ) : (
          log.map((e, i) => (
            <View key={i} style={styles.logRow}>
              <Text style={styles.logName}>{e.event.name}</Text>
              <Text style={styles.logMeta}>
                {e.event.value != null ? `${e.event.value} ${e.event.currency}` : e.event.currency}
                {'  ·  '}
                {e.providers.length ? e.providers.join(', ') : 'no provider'}
              </Text>
            </View>
          ))
        )}
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.section}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={styles.muted}>{k}</Text>
      <Text style={{ color: colors.ink, fontWeight: '600' }}>{v}</Text>
    </View>
  );
}

function Badge({ label, tone }: { label: string; tone: 'ok' | 'off' }) {
  return (
    <View style={[styles.badge, tone === 'ok' ? styles.badgeOk : styles.badgeOff]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 15, fontWeight: '800', color: colors.ink },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hair,
  },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  badgeOk: { backgroundColor: '#dcfce7' },
  badgeOff: { backgroundColor: '#f3f4f6' },
  badgeText: { fontWeight: '700', color: colors.ink, textTransform: 'capitalize' },
  logRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hair,
    paddingBottom: 6,
  },
  logName: { color: colors.ink, fontWeight: '700' },
  logMeta: { color: colors.muted, fontSize: 12 },
});
