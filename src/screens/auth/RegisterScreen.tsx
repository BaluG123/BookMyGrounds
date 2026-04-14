import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { theme } from '../../utils/theme';
import { authAPI } from '../../api/auth';
import { getErrorMessage } from '../../utils/error';

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const [form, setForm] = useState({
    email: '',
    full_name: '',
    phone: '',
    role: 'customer',
    city: '',
    state: '',
    password: '',
    password_confirm: '',
  });
  const [loading, setLoading] = useState(false);

  const selectedRoleCopy = useMemo(
    () =>
      form.role === 'admin'
        ? 'Launch and manage premium turf experiences for your players.'
        : 'Book standout venues quickly and keep every match organized.',
    [form.role],
  );

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    if (form.password !== form.password_confirm) {
      return Alert.alert('Password mismatch', 'Password and confirm password must match.');
    }

    try {
      setLoading(true);
      await authAPI.register(form);
      Alert.alert('Account created', 'Registered successfully. Please login with your new account.');
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert('Registration failed', getErrorMessage(error, 'Check your details and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Icon name="arrow-back" size={20} color={theme.colors.textMain} />
        </TouchableOpacity>

        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>CREATE ACCOUNT</Text>
          <Text style={styles.title}>Build your matchday identity.</Text>
          <Text style={styles.subtitle}>{selectedRoleCopy}</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Choose your mode</Text>
          <View style={styles.roleTabs}>
            <TouchableOpacity
              style={[styles.roleTab, form.role === 'customer' && styles.roleTabActive]}
              onPress={() => handleChange('role', 'customer')}
              activeOpacity={0.88}>
              <Icon
                name="flash-outline"
                size={18}
                color={form.role === 'customer' ? theme.colors.white : theme.colors.primaryDark}
              />
              <Text
                style={[
                  styles.roleTabText,
                  form.role === 'customer' && styles.roleTabTextActive,
                ]}>
                Player
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleTab, form.role === 'admin' && styles.roleTabActiveDark]}
              onPress={() => handleChange('role', 'admin')}
              activeOpacity={0.88}>
              <Icon
                name="business-outline"
                size={18}
                color={form.role === 'admin' ? theme.colors.white : theme.colors.primaryDark}
              />
              <Text style={[styles.roleTabText, form.role === 'admin' && styles.roleTabTextActive]}>
                Host
              </Text>
            </TouchableOpacity>
          </View>

          <Input label="Full Name" value={form.full_name} onChangeText={t => handleChange('full_name', t)} />
          <Input
            label="Email"
            value={form.email}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={t => handleChange('email', t)}
          />
          <Input
            label="Phone"
            value={form.phone}
            keyboardType="phone-pad"
            onChangeText={t => handleChange('phone', t)}
          />

          <View style={styles.row}>
            <Input
              label="City"
              value={form.city}
              onChangeText={t => handleChange('city', t)}
              containerStyle={styles.halfInput}
            />
            <Input
              label="State"
              value={form.state}
              onChangeText={t => handleChange('state', t)}
              containerStyle={styles.halfInput}
            />
          </View>

          <Input
            label="Password"
            value={form.password}
            secureTextEntry
            onChangeText={t => handleChange('password', t)}
          />
          <Input
            label="Confirm Password"
            value={form.password_confirm}
            secureTextEntry
            onChangeText={t => handleChange('password_confirm', t)}
          />

          <Button title="Create Account" onPress={handleRegister} isLoading={loading} style={styles.submitButton} />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already registered?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Go to login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.l,
    paddingBottom: theme.spacing.xxxl + 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.l,
    ...theme.shadows.soft,
  },
  heroCard: {
    marginBottom: theme.spacing.l,
  },
  eyebrow: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textMain,
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    ...theme.typography.bodyL,
    color: theme.colors.textMuted,
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    ...theme.shadows.soft,
  },
  formTitle: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
    marginBottom: theme.spacing.m,
  },
  roleTabs: {
    flexDirection: 'row',
    marginBottom: theme.spacing.l,
  },
  roleTab: {
    flex: 1,
    minHeight: 54,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.s,
    backgroundColor: theme.colors.surface,
  },
  roleTabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  roleTabActiveDark: {
    backgroundColor: theme.colors.surfaceDark,
    borderColor: theme.colors.surfaceDark,
  },
  roleTabText: {
    ...theme.typography.bodyS,
    color: theme.colors.primaryDark,
    marginLeft: 8,
  },
  roleTabTextActive: {
    color: theme.colors.white,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.m,
  },
  halfInput: {
    flex: 1,
  },
  submitButton: {
    marginTop: theme.spacing.s,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.l,
  },
  loginText: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    marginRight: 6,
  },
  loginLink: {
    ...theme.typography.bodyM,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
