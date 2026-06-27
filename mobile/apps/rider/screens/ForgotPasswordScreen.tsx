import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, Typography, Input, Button, SPACING, auth } from '@easyryde/shared';
import type { RiderAuthNav } from '@easyryde/shared';

export default function ForgotPasswordScreen({ navigation }: { navigation: RiderAuthNav }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email) { Alert.alert('Error', 'Please enter your email address'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { Alert.alert('Error', 'Please enter a valid email address'); return; }
    setLoading(true);
    try {
      await auth.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.inner}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <Typography variant="h2" color={COLORS.text} style={styles.title}>Reset Password</Typography>
        <Typography variant="body" color={COLORS.textMuted} style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password.
        </Typography>

        {sent ? (
          <View style={styles.sentContainer}>
            <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
            <Typography variant="h3" color={COLORS.text} style={{ textAlign: 'center', marginTop: SPACING.base }}>
              Email Sent
            </Typography>
            <Typography variant="body" color={COLORS.textMuted} style={{ textAlign: 'center', marginTop: SPACING.sm }}>
              Check your inbox for the password reset link.
            </Typography>
            <Button title="Back to Login" onPress={() => navigation.navigate('Login')} variant="secondary" size="lg" style={{ marginTop: SPACING.xl }} />
          </View>
        ) : (
          <>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ marginBottom: SPACING.base }}
            />
            <Button
              title={loading ? 'Sending...' : 'Send Reset Link'}
              onPress={handleSend}
              disabled={loading}
              size="lg"
              style={{ marginBottom: SPACING.base }}
            />
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  inner: { flex: 1, justifyContent: 'center', padding: SPACING.lg },
  backBtn: { position: 'absolute', top: SPACING.xl, left: SPACING.base, zIndex: 1 },
  title: { textAlign: 'center', marginBottom: SPACING.sm },
  subtitle: { textAlign: 'center', marginBottom: SPACING.xl },
  sentContainer: { alignItems: 'center' },
});
