import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth, COLORS, GRADIENTS, SPACING, RADIUS, useTranslation } from '@easyryde/shared';
import { GlowButton } from '@easyryde/shared';
import { GlassCard } from '@easyryde/shared';
import { GradientText } from '@easyryde/shared';
import { Input } from '@easyryde/shared';
import { Typography } from '@easyryde/shared';

export default function LoginScreen() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 50, bounciness: 4 }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert(t('common.error'), t('auth.fillAllFields')); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { Alert.alert(t('common.error'), t('auth.enterValidEmail')); return; }
    setLoading(true);
    try { await login(email, password); } catch (err: any) { Alert.alert(t('auth.loginFailed'), err.message || t('auth.invalidCredentials')); }
    finally { setLoading(false); }
  };

  return (
    <LinearGradient colors={GRADIENTS.background as unknown as string[]} style={styles.container}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <GradientText colors={GRADIENTS.primary} style={styles.title}>{t('admin.login.title')}</GradientText>
          <Typography variant="body" color={COLORS.textMuted} style={{ textAlign: 'center', marginBottom: 40 }}>{t('admin.login.subtitle')}</Typography>

          <GlassCard padding={SPACING.lg}>
            <Input label={t('auth.email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={{ marginBottom: SPACING.base }} />
            <Input label={t('auth.password')} value={password} onChangeText={setPassword} secureTextEntry style={{ marginBottom: SPACING.lg }} />
            <GlowButton title={loading ? t('auth.signingIn') : t('auth.signIn')} onPress={handleLogin} disabled={loading} loading={loading} size="lg" />
          </GlassCard>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboard: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', padding: SPACING.lg },
  title: { fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: SPACING.sm },
});
