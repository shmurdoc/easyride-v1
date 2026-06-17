import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useAuth, COLORS, Typography, Input, Button, useTranslation } from '@easyryde/shared';
import { SPACING } from '@easyryde/shared';
import type { RiderAuthNav } from '@easyryde/shared';

export default function LoginScreen({ navigation }: { navigation: RiderAuthNav }) {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert(t('common.error'), t('auth.fillAllFields')); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { Alert.alert(t('common.error'), t('auth.enterValidEmail')); return; }
    setLoading(true);
    try { await login(email, password); } catch (err: any) { Alert.alert(t('auth.loginFailed'), err.message || t('auth.invalidCredentials')); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.inner}>
        <Typography variant="h1" color={COLORS.primary} style={{ textAlign: 'center' }}>{t('app.name')}</Typography>
        <Typography variant="body" color={COLORS.textMuted} style={{ textAlign: 'center', marginBottom: 40 }}>{t('app.tagline')}</Typography>

        <Input label={t('auth.email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={{ marginBottom: SPACING.base }} />
        <Input label={t('auth.password')} value={password} onChangeText={setPassword} secureTextEntry style={{ marginBottom: SPACING.base }} />

        <Button title={loading ? t('auth.signingIn') : t('auth.signIn')} onPress={handleLogin} disabled={loading} size="lg" style={{ marginBottom: SPACING.base }} />

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Typography variant="body" color={COLORS.textMuted} style={{ textAlign: 'center' }}>
            {t('auth.noAccount')}
          </Typography>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  inner: { flex: 1, justifyContent: 'center', padding: SPACING.lg },
});
