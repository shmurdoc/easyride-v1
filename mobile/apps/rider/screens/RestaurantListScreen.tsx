import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Image } from 'react-native';
import { foodDelivery } from '@easyryde/shared';
import { COLORS, formatCurrency } from '@easyryde/shared';
import type { Restaurant } from '@easyryde/shared';

export default function RestaurantListScreen({ navigation }: any) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRestaurants(); }, []);

  async function loadRestaurants() {
    try {
      const params: Record<string, string> = { per_page: '50' };
      if (search) params.search = search;
      const data = await foodDelivery.restaurants(params);
      setRestaurants(data.data);
    } catch {} finally { setLoading(false); }
  }

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('RestaurantMenu', { restaurantId: item.id })}
    >
      <View style={styles.cardImage}>
        <Text style={styles.cardImageText}>{item.name[0]}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardCuisine}>{item.cuisine_type || 'Restaurant'}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
          <Text style={styles.deliveryTime}>{item.estimated_delivery_minutes}min</Text>
          <Text style={styles.deliveryFee}>
            {item.delivery_fee > 0 ? formatCurrency(item.delivery_fee) : 'Free delivery'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Delivery</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search restaurants..."
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={loadRestaurants}
      />
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={renderRestaurant}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No restaurants found</Text> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.gray[800], padding: 24, paddingBottom: 8 },
  searchInput: {
    margin: 24, marginBottom: 8, backgroundColor: COLORS.white, borderRadius: 12,
    padding: 12, fontSize: 16, borderWidth: 1, borderColor: COLORS.gray[200],
  },
  list: { padding: 24 },
  card: {
    flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 16,
    marginBottom: 12, overflow: 'hidden',
  },
  cardImage: {
    width: 80, height: 80, backgroundColor: COLORS.primary + '20',
    justifyContent: 'center', alignItems: 'center',
  },
  cardImageText: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary },
  cardContent: { flex: 1, padding: 12 },
  cardName: { fontSize: 16, fontWeight: '600', color: COLORS.gray[800] },
  cardCuisine: { fontSize: 13, color: COLORS.gray[400], marginTop: 2 },
  cardMeta: { flexDirection: 'row', gap: 12, marginTop: 8 },
  rating: { fontSize: 13, color: COLORS.gray[600] },
  deliveryTime: { fontSize: 13, color: COLORS.gray[500] },
  deliveryFee: { fontSize: 13, color: '#10B981', fontWeight: '500' },
  empty: { textAlign: 'center', color: COLORS.gray[400], marginTop: 40 },
});
