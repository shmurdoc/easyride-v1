import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { api, COLORS, GRADIENTS, SPACING, RADIUS } from '@easyryde/shared';
import { Typography, Input, GlassCard, GradientText, Shimmer } from '@easyryde/shared';
import type { RiderNav, RiderRoute } from '@easyryde/shared';

export default function BookRideScreen({ route, navigation }: { route: RiderRoute<'BookRide'>; navigation: RiderNav }) {
  const { pickup } = route.params || {};
  const [dropoffText, setDropoffText] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string; lat: number; lng: number }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dropoffText || dropoffText.length < 3) { setSuggestions([]); return; }
    let cancelled = false;
    setLoading(true);
    api.get('/places/search', { q: dropoffText, near: pickup ? `${pickup.lat},${pickup.lng}` : undefined } as any)
      .then((res) => { if (!cancelled) setSuggestions(Array.isArray((res as any).data?.data) ? (res as any).data.data : []); })
      .catch((err) => { if (!cancelled) console.warn('[BookRide] places search failed:', err?.message); setSuggestions([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [dropoffText, pickup]);

  const handleSelect = (suggestion: { id: string; name: string; lat: number; lng: number }) => {
    navigation.navigate('Main', { screen: 'Home', params: { dropoff: suggestion } });
  };

  return (
    <LinearGradient colors={GRADIENTS.background as unknown as string[]} style={styles.container}>
      <GradientText
        colors={GRADIENTS.primary}
        style={{ fontSize: 26, fontWeight: '700', marginBottom: SPACING.lg }}
      >
        Where to?
      </GradientText>

      <Input value={dropoffText} onChangeText={setDropoffText} placeholder="Search destination" style={{ marginBottom: SPACING.base }} />

      {loading && (
        <View style={{ gap: SPACING.sm }}>
          {[1, 2, 3].map(i => (
            <Shimmer key={i} height={56} borderRadius={RADIUS.lg} />
          ))}
        </View>
      )}

      {!loading && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={dropoffText.length >= 3 ? (
            <Typography variant="body" color={COLORS.textMuted} style={{ textAlign: 'center' }}>No matching places</Typography>
          ) : null}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.suggestion} onPress={() => handleSelect(item)}>
              <GlassCard padding={SPACING.base} style={{ flex: 1 }}>
                <Typography variant="body" style={{ flex: 1 }}>{item.name}</Typography>
              </GlassCard>
            </TouchableOpacity>
          )}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.base },
  suggestion: { marginBottom: SPACING.sm },
});
