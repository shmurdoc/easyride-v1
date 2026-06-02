import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { admin } from '@easyryde/shared';
import { COLORS } from '@easyryde/shared';

interface Setting {
  key: string;
  value: string;
  type: string;
  description: string;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    try {
      const data = await admin.settings();
      const settingsArray = Object.entries(data).map(([key, val]: [string, any]) => ({
        key,
        value: val.value || '',
        type: val.type || 'string',
        description: val.description || '',
      }));
      setSettings(settingsArray);
    } catch {} finally { setLoading(false); }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Platform Settings</Text>
      <FlatList
        data={settings}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.settingKey}>{item.key}</Text>
            <Text style={styles.settingDesc}>{item.description}</Text>
            <TextInput style={styles.input} value={item.value} editable={false} />
            <Text style={styles.typeBadge}>Type: {item.type}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No settings configured</Text> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.gray[800], padding: 24, paddingBottom: 8 },
  list: { padding: 24 },
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 12 },
  settingKey: { fontSize: 16, fontWeight: '600', color: COLORS.gray[800], marginBottom: 4 },
  settingDesc: { fontSize: 13, color: COLORS.gray[400], marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: COLORS.gray[200], borderRadius: 8, padding: 10,
    fontSize: 14, backgroundColor: COLORS.gray[50], color: COLORS.gray[600],
  },
  typeBadge: { fontSize: 11, color: COLORS.gray[400], marginTop: 6 },
  empty: { textAlign: 'center', color: COLORS.gray[400], marginTop: 40 },
});
