import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { admin, COLORS, GRADIENTS, SPACING, RADIUS } from '@easyryde/shared';
import { Typography } from '@easyryde/shared';
import { GlassCard } from '@easyryde/shared';
import { GradientText } from '@easyryde/shared';
import { Shimmer } from '@easyryde/shared';
import type { User } from '@easyryde/shared';

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try {
      const params: Record<string, string> = { per_page: '50' };
      if (search) params.search = search;
      const data = await admin.users(params);
      setUsers(data.data);
    } catch (err) { console.warn('Failed to load users:', err); } finally { setLoading(false); setRefreshing(false); }
  }

  const handleSearch = () => { setLoading(true); loadUsers(); };
  const onRefresh = React.useCallback(() => { setRefreshing(true); loadUsers(); }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <Typography variant="h2" style={{ padding: SPACING.base, paddingBottom: SPACING.sm }}>Users</Typography>
        <View style={{ paddingHorizontal: SPACING.base, marginBottom: SPACING.base }}>
          <Shimmer height={48} borderRadius={RADIUS.md} />
        </View>
        {[1, 2, 3].map((i) => (
          <GlassCard key={i} style={{ marginHorizontal: SPACING.base, marginBottom: SPACING.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
              <Shimmer width={120} height={18} />
              <Shimmer width={60} height={24} borderRadius={RADIUS.full} />
            </View>
            <Shimmer width="70%" height={14} style={{ marginBottom: SPACING.xs }} />
            <Shimmer width="50%" height={14} />
          </GlassCard>
        ))}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <LinearGradient colors={['rgba(212,175,55,0.1)', 'rgba(0,0,0,0)']} style={styles.header}>
        <Typography variant="h2">Users</Typography>
      </LinearGradient>
      <View style={{ paddingHorizontal: SPACING.base, marginBottom: SPACING.base }}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
        />
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: SPACING.base }}
        ListEmptyComponent={<Typography variant="body" color={COLORS.textDim} style={{ textAlign: 'center', marginTop: 40 }}>No users found</Typography>}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <GlassCard style={{ marginBottom: SPACING.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs }}>
              <GradientText colors={GRADIENTS.primary} style={styles.userName}>{item.name}</GradientText>
              <View style={[styles.badge, { backgroundColor: item.role === 'driver' ? COLORS.successGlow : 'rgba(94,158,255,0.15)' }]}>
                <Typography variant="xs" color={item.role === 'driver' ? COLORS.success : COLORS.info}>{item.role}</Typography>
              </View>
            </View>
            <Typography variant="small" color={COLORS.textMuted}>{item.email}</Typography>
            <Typography variant="small" color={COLORS.textDim}>{item.phone_number}</Typography>
          </GlassCard>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: SPACING['2xl'], paddingBottom: SPACING.sm, paddingHorizontal: SPACING.base },
  searchInput: {
    backgroundColor: COLORS.glass,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    color: COLORS.text,
  },
  userName: { fontSize: 16, fontWeight: '600' },
  badge: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs },
});
