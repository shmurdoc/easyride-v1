import React, { useState, useEffect, useRef } from 'react';
import { FlatList, TouchableOpacity, StyleSheet, Alert, Linking, Animated, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { rides, api, COLORS, GRADIENTS, SPACING, RADIUS } from '@easyryde/shared';
import { ActivityCard, Shimmer, GradientText } from '@easyryde/shared';
import type { Ride } from '@easyryde/shared';

export default function RideHistoryScreen({ navigation }: any) {
  const [rideHistory, setRideHistory] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadHistory(); }, []);

  async function loadHistory() {
    try { const data = await rides.list({ per_page: '50' }); setRideHistory(data.data); }
    catch (err) { console.warn('Failed to load ride history:', err); } finally { setLoading(false); }
  }

  function RideItem({ item, index }: { item: Ride; index: number }) {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 12,
        bounciness: 6,
        delay: index * 60,
      }).start();
    }, []);
    const style = { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] };
    return (
      <Animated.View style={style}>
        <TouchableOpacity
          onPress={() => navigation.navigate('RideTracking', { rideId: item.id })}
          style={styles.listItem}
        >
          <View style={styles.listIcon}>
            <Ionicons name="car-outline" size={20} color={COLORS.textMuted} />
          </View>
          <View style={styles.listText}>
            <Text style={styles.listAddress}>{item.pickup_address} → {item.dropoff_address}</Text>
            <Text style={styles.listDate}>{item.category || 'Comfort'}</Text>
            {item.total_fare && (
              <Text style={styles.listFare}>R {item.total_fare.toFixed(2)}</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textDim} />
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Activity</Text>
        <View style={{ padding: SPACING.base, gap: SPACING.md }}>
          <Shimmer height={160} borderRadius={RADIUS.lg} />
          {[1, 2, 3].map(i => (
            <Shimmer key={i} height={72} borderRadius={RADIUS.md} />
          ))}
        </View>
      </View>
    );
  }

  const recentRide = rideHistory[0];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Activity</Text>
        <Ionicons name="time-outline" size={22} color={COLORS.textMuted} />
      </View>

      <FlatList
        data={rideHistory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: SPACING.base }}
        ListHeaderComponent={
          <>
            {recentRide && (
              <>
                <Text style={styles.sectionLabel}>Past</Text>
                <ActivityCard
                  ride={recentRide}
                  onPress={() => navigation.navigate('RideTracking', { rideId: recentRide.id })}
                />
              </>
            )}
          </>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No rides yet</Text>
        }
        renderItem={({ item, index }) => <RideItem item={item} index={index} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.base,
    paddingBottom: SPACING.sm,
  },
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '700',
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listText: {
    flex: 1,
  },
  listAddress: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  listDate: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  listFare: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  emptyText: {
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
});
