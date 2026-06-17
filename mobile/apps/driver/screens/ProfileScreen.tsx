import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth, drivers, COLORS, GRADIENTS, SPACING, RADIUS, Avatar, GlassCard, GlowButton, GradientText } from '@easyryde/shared';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [vehicleModal, setVehicleModal] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({ make: '', model: '', year: '', license_plate: '', color: '', category: 'standard' });

  const handleRegisterVehicle = async () => {
    try {
      await drivers.registerVehicle({
        make: vehicleForm.make,
        model: vehicleForm.model,
        year: parseInt(vehicleForm.year, 10) || 0,
        color: vehicleForm.color,
        license_plate: vehicleForm.license_plate,
        category: vehicleForm.category,
      });
      Alert.alert('Success', 'Vehicle registered');
      setVehicleModal(false);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const menuItems = [
    {
      label: 'Vehicle Info',
      onPress: () => setVehicleModal(true),
    },
    {
      label: 'Documents',
      onPress: () => Alert.alert('Documents', 'Upload documents feature coming soon.'),
    },
    {
      label: 'Notifications',
      onPress: () => Alert.alert('Notifications', 'Notification settings coming soon.'),
    },
    {
      label: 'Help & Support',
      onPress: () => Alert.alert('Help & Support', 'Contact us at support@easyryde.com or call +1-800-EASYRYDE.'),
    },
  ];

  return (
    <LinearGradient colors={[COLORS.bgGradientStart, COLORS.bgGradientEnd]} style={styles.container}>
      <LinearGradient colors={['rgba(212,175,55,0.2)', 'rgba(212,175,55,0)']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={{ paddingTop: 60, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.base, alignItems: 'center' }}>
        <View style={{ shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10, borderRadius: 44 }}>
          <Avatar name={user?.name || ''} size={80} />
        </View>
        <GradientText colors={GRADIENTS.primary} style={{ fontSize: 20, fontWeight: '600', lineHeight: 28, marginTop: SPACING.md }}>{user?.name}</GradientText>
        <GradientText colors={GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27 }}>{user?.email}</GradientText>
        <GradientText colors={GRADIENTS.primary} style={{ fontSize: 13, fontWeight: '600', lineHeight: 18 }}>Driver</GradientText>
      </LinearGradient>

      <View style={{ padding: SPACING.base, gap: SPACING.sm }}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.label} onPress={item.onPress}>
            <GlassCard><GradientText colors={GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27 }}>{item.label}</GradientText></GlassCard>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={() => Alert.alert('Logout', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Logout', style: 'destructive', onPress: logout }])}>
          <GlassCard>
            <GradientText colors={['#FF3B5C', '#FF3B5C']} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27 }}>Sign Out</GradientText>
          </GlassCard>
        </TouchableOpacity>
      </View>

      <Modal visible={vehicleModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <GlassCard glow style={{ margin: SPACING.base, padding: SPACING.lg }}>
            <GradientText colors={GRADIENTS.primary} style={{ fontSize: 20, fontWeight: '600', lineHeight: 28, marginBottom: SPACING.md }}>Vehicle Info</GradientText>
            {(['make', 'model', 'year', 'license_plate', 'color', 'category'] as const).map((field) => (
              <TextInput
                key={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                placeholderTextColor={COLORS.textMuted}
                value={vehicleForm[field]}
                onChangeText={(text) => setVehicleForm((prev) => ({ ...prev, [field]: text }))}
                style={{ borderWidth: 1, borderColor: COLORS.glassBorder, backgroundColor: COLORS.glass, borderRadius: RADIUS.sm, padding: SPACING.sm, marginBottom: SPACING.sm, color: COLORS.text }}
              />
            ))}
            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              <GlowButton title="Cancel" onPress={() => setVehicleModal(false)} size="sm" glowColor={COLORS.error} style={{ flex: 1 }} />
              <GlowButton title="Save" onPress={handleRegisterVehicle} size="sm" style={{ flex: 1 }} />
            </View>
          </GlassCard>
        </KeyboardAvoidingView>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
