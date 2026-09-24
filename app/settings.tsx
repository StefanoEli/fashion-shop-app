import { Stack } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '../lib/theme';
import {
  getSettings,
  reinitTracking,
  resetSettings,
  saveSettings,
  tracking,
  type EventLogEntry,
  type ProvidersConfig,
} from '../lib/tracking';

export default function AdminScreen() {
  const [cfg, setCfg] = useState<ProvidersConfig>(() => getSettings());
  const [tokensText, setTokensText] = useState<string>(() =>
    JSON.stringify(getSettings().adjust.eventTokens ?? {}),
  );
  const [log, setLog] = useState<EventLogEntry[]>(tracking.getLog());
  const [status, setStatus] = useState<string>('');
  const [active, setActive] = useState<string[]>(() => tracking.activeProviders());

  useEffect(() => tracking.subscribe(setLog), []);
  // Providers finish initializing asynchronously (after ATT / settings load),
  // so refresh the active list shortly after mount.
  useEffect(() => {
    const t = setTimeout(() => setActive(tracking.activeProviders()), 400);
    return () => clearTimeout(t);
  }, []);

  const setAF = (patch: Partial<ProvidersConfig['appsflyer']>) =>
    setCfg((c) => ({ ...c, appsflyer: { ...c.appsflyer, ...patch } }));
  const setAdj = (patch: Partial<ProvidersConfig['adjust']>) =>
    setCfg((c) => ({ ...c, adjust: { ...c.adjust, ...patch } }));

  const onSave = async () => {
    let eventTokens = cfg.adjust.eventTokens;
    if (tokensText.trim()) {
      try {
        eventTokens = JSON.parse(tokensText);
      } catch {
        setStatus('⚠️ Adjust event tokens is not valid JSON — not saved.');
        return;
      }
    } else {
      eventTokens = {};
    }
    const next: ProvidersConfig = {
      appsflyer: { ...cfg.appsflyer },
      adjust: { ...cfg.adjust, eventTokens },
    };
    await saveSettings(next);
    reinitTracking();
    setCfg(next);
    setActive(tracking.activeProviders());
    setStatus(`✅ Saved. Active: ${tracking.activeProviders().join(', ') || 'none'}. Native SDKs fully apply after an app restart.`);
  };

  const onReset = async () => {
    const def = await resetSettings();
    reinitTracking();
    setCfg(def);
    setActive(tracking.activeProviders());
    setTokensText(JSON.stringify(def.adjust.eventTokens ?? {}));
    setStatus('↩️ Reset to .env defaults.');
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Stack.Screen options={{ title: 'Admin — MMP config' }} />

      <Text style={styles.hint}>
        SDKs are compiled into the app at build time. Here you toggle providers and paste their keys
        to activate/configure them at runtime. In Expo Go / web the native SDKs are unavailable, so
        events are logged only — use a dev/EAS build to forward them.
      </Text>

      <Section title="AppsFlyer">
        <Row label="Enabled">
          <Switch value={cfg.appsflyer.enabled} onValueChange={(v) => setAF({ enabled: v })} />
        </Row>
        <Field
          label="Dev key"
          value={cfg.appsflyer.devKey}
          onChangeText={(t) => setAF({ devKey: t })}
          placeholder="AppsFlyer dev key"
        />
        <Field
          label="iOS App ID"
          value={cfg.appsflyer.appId}
          onChangeText={(t) => setAF({ appId: t })}
          placeholder="e.g. 1234567890"
          keyboardType="number-pad"
        />
        <Row label="Debug logs">
          <Switch value={cfg.appsflyer.isDebug} onValueChange={(v) => setAF({ isDebug: v })} />
        </Row>
      </Section>

      <Section title="Adjust">
        <Row label="Enabled">
          <Switch value={cfg.adjust.enabled} onValueChange={(v) => setAdj({ enabled: v })} />
        </Row>
        <Field
          label="App token"
          value={cfg.adjust.appToken}
          onChangeText={(t) => setAdj({ appToken: t })}
          placeholder="Adjust app token"
        />
        <Row label="Environment">
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['sandbox', 'production'] as const).map((e) => (
              <Pressable
                key={e}
                onPress={() => setAdj({ environment: e })}
                style={[styles.chip, cfg.adjust.environment === e && styles.chipActive]}
              >
                <Text
                  style={[styles.chipText, cfg.adjust.environment === e && styles.chipTextActive]}
                >
                  {e}
                </Text>
              </Pressable>
            ))}
          </View>
        </Row>
        <Field
          label="Event tokens (JSON: canonical event → token)"
          value={tokensText}
          onChangeText={setTokensText}
          placeholder='{"purchase":"abc123","add_to_cart":"def456"}'
          multiline
        />
      </Section>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable style={[styles.btn, styles.btnPrimary]} onPress={onSave}>
          <Text style={styles.btnPrimaryText}>Save & apply</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnGhost]} onPress={onReset}>
          <Text style={styles.btnGhostText}>Reset to .env</Text>
        </Pressable>
      </View>
      {status ? <Text style={styles.status}>{status}</Text> : null}

      <Section title={`Active providers`}>
        {active.length ? (
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {active.map((p) => (
              <View key={p} style={styles.badge}>
                <Text style={styles.badgeText}>{p}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.muted}>No provider enabled.</Text>
        )}
      </Section>

      <Section title={`Event log (${log.length})`}>
        <Pressable onPress={() => tracking.clearLog()} style={styles.clearBtn}>
          <Text style={styles.clearText}>Clear log</Text>
        </Pressable>
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

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.rowBetween}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad' | 'email-address';
  multiline?: boolean;
}) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={keyboardType ?? 'default'}
        multiline={multiline}
        style={[styles.input, multiline && { minHeight: 64 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  section: { fontSize: 15, fontWeight: '800', color: colors.ink },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hair,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: colors.ink, fontWeight: '600', fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: colors.hair,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.ink,
    backgroundColor: colors.bg,
    fontSize: 14,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.hair,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: colors.bg,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.ink, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: colors.accentInk },
  btn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnPrimary: { backgroundColor: colors.accent },
  btnPrimaryText: { color: colors.accentInk, fontWeight: '800' },
  btnGhost: { backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.hair },
  btnGhostText: { color: colors.ink, fontWeight: '700' },
  status: { color: colors.ink, fontSize: 13 },
  muted: { color: colors.muted, fontSize: 13 },
  badge: { backgroundColor: '#dcfce7', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  badgeText: { fontWeight: '700', color: colors.ink, textTransform: 'capitalize' },
  clearBtn: { alignSelf: 'flex-start' },
  clearText: { color: '#dc2626', fontWeight: '700', fontSize: 12 },
  logRow: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hair, paddingBottom: 6 },
  logName: { color: colors.ink, fontWeight: '700' },
  logMeta: { color: colors.muted, fontSize: 12 },
});
