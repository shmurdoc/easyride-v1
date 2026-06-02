import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { api, COLORS } from '@easyryde/shared';

export default function BookRideScreen({ route, navigation }: any) {
  const { pickup } = route.params || {};
  const [dropoffText, setDropoffText] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string; lat: number; lng: number }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dropoffText || dropoffText.length < 3) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api
      .get('/v1/places/search', { params: { q: dropoffText, near: pickup ? `${pickup.lat},${pickup.lng}` : undefined } })
      .then((res) => {
        if (cancelled) return;
        setSuggestions(Array.isArray(res.data?.data) ? res.data.data : []);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn('[BookRide] places search failed:', err?.message);
        setSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dropoffText, pickup]);

  const handleSelect = (suggestion: { id: string; name: string; lat: number; lng: number }) => {
    navigation.navigate('Main', {
      screen: 'Home',
      params: { dropoff: suggestion },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where to?</Text>

      <TextInput
        style={styles.input}
        placeholder="Search destination"
        value={dropoffText}
        onChangeText={setDropoffText}
        autoFocus
      />

      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          dropoffText.length >= 3 && !loading ? (
            <Text style={styles.empty}>No matching places</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.suggestion} onPress={() => handleSelect(item)}>
            <Text style={styles.suggestionIcon}>📍</Text>
            <Text style={styles.suggestionName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.gray[800], marginBottom: 24 },
  input: {
    borderWidth: 1, borderColor: COLORS.gray[200], borderRadius: 12,
    padding: 16, fontSize: 16, marginBottom: 16, backgroundColor: COLORS.gray[50],
  },
  suggestion: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.gray[100],
  },
  suggestionIcon: { fontSize: 20, marginRight: 12 },
  suggestionName: { fontSize: 16, color: COLORS.gray[700] },
});
