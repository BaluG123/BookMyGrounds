import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { theme } from '../../utils/theme';
import { authAPI } from '../../api/auth';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

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

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    if (form.password !== form.password_confirm) {
      return Alert.alert('Error', 'Passwords do not match');
    }
    try {
      setLoading(true);
      const res = await authAPI.register(form);
      if (res.data.token) {
        dispatch(setCredentials({ token: res.data.token, user: res.data.user }));
      } else {
        Alert.alert('Success', 'Registered successfully, please login.');
        navigation.navigate('Login');
      }
    } catch (error: any) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Icon name="arrow-back" size={24} color={theme.colors.textMain} onPress={() => navigation.goBack()} />
          <Text style={styles.title}>Create Account</Text>
        </View>

        <View style={styles.roleSelection}>
          <Text style={styles.label}>I want to...</Text>
          <View style={styles.roleTabs}>
            <Button
              title="Book Turfs"
              variant={form.role === 'customer' ? 'primary' : 'outline'}
              style={styles.roleTab}
              onPress={() => handleChange('role', 'customer')}
            />
            <Button
              title="Host Turfs"
              variant={form.role === 'admin' ? 'primary' : 'outline'}
              style={styles.roleTab}
              onPress={() => handleChange('role', 'admin')}
            />
          </View>
        </View>

        <Input label="Full Name" value={form.full_name} onChangeText={(t) => handleChange('full_name', t)} />
        <Input label="Email" value={form.email} autoCapitalize="none" keyboardType="email-address" onChangeText={(t) => handleChange('email', t)} />
        <Input label="Phone" value={form.phone} keyboardType="phone-pad" onChangeText={(t) => handleChange('phone', t)} />
        
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input label="City" value={form.city} onChangeText={(t) => handleChange('city', t)} />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Input label="State" value={form.state} onChangeText={(t) => handleChange('state', t)} />
          </View>
        </View>

        <Input label="Password" value={form.password} secureTextEntry onChangeText={(t) => handleChange('password', t)} />
        <Input label="Confirm Password" value={form.password_confirm} secureTextEntry onChangeText={(t) => handleChange('password_confirm', t)} />

        <Button title="Register" onPress={handleRegister} isLoading={loading} style={styles.btn} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.l,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textMain,
    marginLeft: theme.spacing.m,
  },
  label: {
    ...theme.typography.bodyM,
    fontWeight: '600',
    marginBottom: theme.spacing.s,
  },
  roleSelection: {
    marginBottom: theme.spacing.l,
  },
  roleTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleTab: {
    flex: 0.48,
  },
  row: {
    flexDirection: 'row',
  },
  btn: {
    marginTop: theme.spacing.l,
    marginBottom: theme.spacing.xxl,
  },
});
