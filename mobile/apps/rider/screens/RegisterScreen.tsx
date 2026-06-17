import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { View } from 'react-native';
import { useAuth, COLORS, Typography, Input, Button, useTranslation } from '@easyryde/shared';
import { SPACING } from '@easyryde/shared';
import type { RiderAuthNav } from '@easyryde/shared';

export default function RegisterScreen({ navigation }: { navigation: RiderAuthNav }) {
  const { register } = useAuth();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) { Alert.alert(t('common.error'), t('auth.fillAllFields')); return; }
    if (password !== confirmPassword) { Alert.alert(t('common.error'), t('auth.passwordsDoNotMatch')); return; }
    if (password.length < 8) { Alert.alert(t('common.error'), t('auth.passwordMinLength')); return; }
    setLoading(true);
    try { await register({ name, email, phone_number: phone, password, password_confirmation: confirmPassword }); }
    catch (err: any) { Alert.alert(t('auth.registrationFailed'), err.message || t('auth.pleaseTryAgain')); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Typography variant="h2" color={COLORS.text} style={{ textAlign: 'center' }}>{t('auth.createAccount')}</Typography>
        <Typography variant="body" color={COLORS.textMuted} style={{ textAlign: 'center', marginBottom: SPACING.xl }}>{t('app.tagline')}</Typography>

        <Input label={t('auth.fullName')} value={name} onChangeText={setName} style={{ marginBottom: SPACING.md }} />
        <Input label={t('auth.email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={{ marginBottom: SPACING.md }} />
        <Input label={t('auth.phoneNumber')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={{ marginBottom: SPACING.md }} />
        <Input label={t('auth.password')} value={password} onChangeText={setPassword} secureTextEntry style={{ marginBottom: SPACING.md }} />
        <Input label={t('auth.confirmPassword')} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry style={{ marginBottom: SPACING.lg }} />

        <Button title={loading ? t('auth.creatingAccount') : t('auth.signUp')} onPress={handleRegister} disabled={loading} size="lg" style={{ marginBottom: SPACING.base }} />

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Typography variant="body" color={COLORS.textMuted} style={{ textAlign: 'center' }}>
            {t('auth.hasAccount')}
          </Typography>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  inner: { padding: SPACING.lg, paddingTop: 60 },
});
