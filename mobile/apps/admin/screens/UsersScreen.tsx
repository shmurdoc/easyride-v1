import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { admin } from '@easyryde/shared';
import { COLORS } from '@easyryde/shared';
import type { User } from '@easyryde/shared';

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try {
      const params: Record<string, string> = { per_page: '50' };
      if (search) params.search = search;
      const data = await admin.users(params);
      setUsers(data.data);
    } catch {} finally { setLoading(false); }
  }

  const handleSearch = () => { setLoading(true); loadUsers(); };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users</Text>
      <View style={styles.searchBar}>
        <TextInput style={styles.searchInput} placeholder="Search users..." value={search} onChangeText={setSearch} onSubmitEditing={handleSearch} />
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={[styles.badge, item.role === 'driver' ? styles.badgeDriver : styles.badgeRider]}>
                <Text style={styles.badgeText}>{item.role}</Text>
              </View>
            </View>
            <Text style={styles.email}>{item.email}</Text>
            <Text style={styles.phone}>{item.phone_number}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.gray[800], padding: 24, paddingBottom: 8 },
  searchBar: { paddingHorizontal: 24, marginBottom: 8 },
  searchInput: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 12, fontSize: 16,
    borderWidth: 1, borderColor: COLORS.gray[200],
  },
  list: { padding: 24 },
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: '600', color: COLORS.gray[800] },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 2 },
  badgeDriver: { backgroundColor: '#10B98120' },
  badgeRider: { backgroundColor: '#3B82F620' },
  badgeText: { fontSize: 12, fontWeight: '600', color: COLORS.gray[600] },
  email: { fontSize: 14, color: COLORS.gray[500] },
  phone: { fontSize: 13, color: COLORS.gray[400] },
});
