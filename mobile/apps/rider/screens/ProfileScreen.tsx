import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Alert, View, Text, TextInput, ScrollView, Modal } from 'react-native';
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

const SUPPORT_INFO = {
  email: 'support@easyryde.com',
  phone: '015 000 0000',
  hours: 'Mon–Sun, 06:00–22:00',
};

export default function ProfileScreen({ navigation }: { navigation: RiderNav }) {
  const { user, logout } = useAuth();
  const [showHelpModal, setShowHelpModal] = useState(false);

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
          onPress={() => setShowHelpModal(true)}
        />
        <QuickActionButton
          icon="wallet-outline"
          label="Wallet"
          onPress={() => navigation.navigate('Wallet')}
        />
        <QuickActionButton
          icon="time-outline"
          label="Trips"
          onPress={() => navigation.navigate('RideHistory')}
        />
      </View>

      <View style={styles.menuSection}>
        {MENU_ITEMS.map((item, i) => (
          <TouchableOpacity key={i} style={styles.menuRow} onPress={() => {
            if (item.label === 'Messages') Alert.alert('Messages', 'Chat with your driver during active rides from the ride screen.');
            else if (item.label === 'Settings') Alert.alert('Settings', 'Settings will be available in a future update.');
            else if (item.label === 'Legal') Alert.alert('Legal', 'EasyRyde Terms of Service & Privacy Policy\n\nBy using EasyRyde you agree to our terms. Full documents available on our website.');
            else Alert.alert(item.label, 'This feature is coming soon.');
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

      <TouchableOpacity style={styles.updateBtn} onPress={() => Alert.alert('Driver App', 'Download the EasyRyde Driver app from the app store to start earning.')}>
        <Ionicons name="car-outline" size={18} color={COLORS.primary} />
        <Text style={styles.updateBtnText}>Switch to Driver</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutRow} onPress={() => {
        Alert.alert('Logout', 'Are you sure?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive', onPress: logout },
        ]);
      }}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Modal visible={showHelpModal} transparent animationType="slide" onRequestClose={() => setShowHelpModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowHelpModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Help & Support</Text>
            <View style={styles.helpSection}>
              <Text style={styles.helpLabel}>Email</Text>
              <Text style={styles.helpValue}>{SUPPORT_INFO.email}</Text>
            </View>
            <View style={styles.helpSection}>
              <Text style={styles.helpLabel}>Phone</Text>
              <Text style={styles.helpValue}>{SUPPORT_INFO.phone}</Text>
            </View>
            <View style={styles.helpSection}>
              <Text style={styles.helpLabel}>Hours</Text>
              <Text style={styles.helpValue}>{SUPPORT_INFO.hours}</Text>
            </View>
            <Text style={styles.helpNote}>For urgent ride issues, contact your driver directly through the in-app chat during your ride.</Text>
          </View>
        </View>
      </Modal>
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
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: SPACING.md,
  },
  updateBtnText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  modalClose: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: SPACING.lg,
  },
  helpSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  helpLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  helpValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  helpNote: {
    color: COLORS.textDim,
    fontSize: 12,
    marginTop: SPACING.md,
    lineHeight: 18,
  },
});
