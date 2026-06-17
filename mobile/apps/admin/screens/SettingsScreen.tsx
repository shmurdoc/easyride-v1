import React, { useState, useEffect } from 'react';
import { FlatList, TextInput, StyleSheet, View, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { admin, COLORS, GRADIENTS, SPACING, RADIUS } from '@easyryde/shared';
import { Typography } from '@easyryde/shared';
import { Badge } from '@easyryde/shared';
import { GlassCard } from '@easyryde/shared';
import { GradientText } from '@easyryde/shared';
import { GlowButton } from '@easyryde/shared';
import { Shimmer } from '@easyryde/shared';

interface Setting { key: string; value: string; type: string; description: string; }

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    try {
      const data = await admin.settings();
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        setSettings(Object.entries(data).map(([key, val]: [string, any]) => ({ key, value: val.value || '', type: val.type || 'string', description: val.description || '' })));
      }
    } catch (err) { console.warn('Failed to load settings:', err); } finally { setLoading(false); }
  }

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const saveSetting = async (key: string) => {
    setSaving(key);
    try {
      await admin.updateSettings({ key, value: settings.find(s => s.key === key)?.value || '' });
    } catch (err: any) { Alert.alert('Error', err.message || 'Failed to save'); } finally { setSaving(null); }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <Typography variant="h2" style={{ padding: SPACING.base, paddingBottom: SPACING.sm }}>Platform Settings</Typography>
        {[1, 2, 3].map((i) => (
          <GlassCard key={i} style={{ marginHorizontal: SPACING.base, marginBottom: SPACING.md }}>
            <Shimmer width={120} height={18} style={{ marginBottom: SPACING.sm }} />
            <Shimmer width="100%" height={14} style={{ marginBottom: SPACING.sm }} />
            <Shimmer width="100%" height={40} borderRadius={RADIUS.md} style={{ marginBottom: SPACING.sm }} />
            <Shimmer width={80} height={20} borderRadius={RADIUS.full} />
          </GlassCard>
        ))}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <LinearGradient colors={['rgba(212,175,55,0.1)', 'rgba(0,0,0,0)']} style={styles.header}>
        <Typography variant="h2">Platform Settings</Typography>
      </LinearGradient>
      <FlatList
        data={settings}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ padding: SPACING.base }}
        ListEmptyComponent={<Typography variant="body" color={COLORS.textMuted} style={{ textAlign: 'center', marginTop: 40 }}>No settings configured</Typography>}
        renderItem={({ item }) => (
          <GlassCard style={{ marginBottom: SPACING.md }}>
            <GradientText colors={GRADIENTS.primary} style={styles.settingKey}>{item.key}</GradientText>
            <Typography variant="small" color={COLORS.textMuted} style={{ marginBottom: SPACING.sm }}>{item.description}</Typography>
            <TextInput style={styles.input} value={item.value} onChangeText={(v) => updateSetting(item.key, v)} placeholderTextColor={COLORS.textDim} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.sm }}>
              <Badge label={`Type: ${item.type}`} variant="default" />
              <GlowButton title={saving === item.key ? 'Saving...' : 'Save'} onPress={() => saveSetting(item.key)} size="sm" glowColor={COLORS.primary} />
            </View>
          </GlassCard>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: SPACING['2xl'], paddingBottom: SPACING.sm, paddingHorizontal: SPACING.base },
  settingKey: { fontSize: 16, fontWeight: '600', marginBottom: SPACING.xs },
  input: {
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.md,
    padding: 10,
    fontSize: 14,
    backgroundColor: COLORS.glass,
    color: COLORS.text,
  },
});
