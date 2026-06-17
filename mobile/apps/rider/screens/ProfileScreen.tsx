import React from 'react';
import { TouchableOpacity, StyleSheet, Alert, View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, COLORS, SPACING, RADIUS, SHADOWS } from '@easyryde/shared';
import { QuickActionButton, Avatar } from '@easyryde/shared';
import type { RiderNav } from '@easyryde/shared';

const MENU_ITEMS = [
  { icon: 'chatbubbles' as const, label: 'Messages', badge: true },
  { icon: 'settings-outline' as const, label: 'Settings', badge: false },
  { icon: 'car-outline' as const, label: 'Earn by driving or delivering', badge: false },
  { icon: 'document-text-outline' as const, label: 'Legal', badge: false },
];

export default function ProfileScreen({ navigation }: { navigation: RiderNav }) {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={styles.hiText}>Hi there</Text>
          <Text style={styles.nameText}>{user?.name || 'Rider'}</Text>
        </View>
        <Avatar name={user?.name || ''} size={56} />
      </View>

      <View style={styles.quickActions}>
        <QuickActionButton
          icon="help-circle-outline"
          label="Help"
          onPress={() => Alert.alert('Help & Support', 'Email: support@easyryde.com\nPhone: +1 800 EASYRYDE\nWe are available 24/7.')}
        />
        <QuickActionButton
          icon="wallet-outline"
          label="Wallet"
          onPress={() => navigation.navigate('Wallet')}
        />
        <QuickActionButton
          icon="time-outline"
          label="Trips"
          onPress={() => {}}
        />
      </View>

      <View style={styles.menuSection}>
        {MENU_ITEMS.map((item, i) => (
          <TouchableOpacity key={i} style={styles.menuRow} onPress={() => {
            if (item.label === 'Messages') Alert.alert('Messages', 'No new messages');
            else if (item.label === 'Settings') Alert.alert('Settings', 'Coming soon');
            else if (item.label === 'Legal') Alert.alert('Legal', 'Terms of Service & Privacy Policy');
            else Alert.alert(item.label, 'Coming soon');
          }}>
            <View style={styles.menuLeft}>
              <Ionicons name={item.icon} size={20} color={COLORS.text} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.badge && <View style={styles.menuBadge} />}
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textDim} />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.version}>v1.0.0</Text>

      <TouchableOpacity style={styles.signOutRow} onPress={() => {
        Alert.alert('Logout', 'Are you sure?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive', onPress: logout },
        ]);
      }}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: SPACING.base,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingTop: SPACING.lg + 40,
  },
  greeting: {
    flex: 1,
  },
  hiText: {
    color: COLORS.textMuted,
    fontSize: 15,
    marginBottom: 4,
  },
  nameText: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  menuSection: {
    gap: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  menuLabel: {
    color: COLORS.text,
    fontSize: 15,
    flex: 1,
  },
  menuBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  version: {
    color: COLORS.textDim,
    fontSize: 12,
    textAlign: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  signOutRow: {
    padding: SPACING.md,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  signOutText: {
    color: COLORS.error,
    fontSize: 15,
    fontWeight: '600',
  },
});
