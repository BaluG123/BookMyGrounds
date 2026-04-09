import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../utils/theme';
import { authAPI } from '../../api/auth';
import { getErrorMessage } from '../../utils/error';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export default function PayoutProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    account_holder_name: '',
    bank_account_number: '',
    ifsc_code: '',
    upi_id: '',
    bank_name: '',
    branch_name: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await authAPI.getPayoutProfile();
      setForm({
        account_holder_name: res.data.account_holder_name || '',
        bank_account_number: res.data.bank_account_number || '',
        ifsc_code: res.data.ifsc_code || '',
        upi_id: res.data.upi_id || '',
        bank_name: res.data.bank_name || '',
        branch_name: res.data.branch_name || '',
      });
    } catch (error) {
      Alert.alert('Unable to load payout profile', getErrorMessage(error, 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await authAPI.updatePayoutProfile(form);
      Alert.alert('Saved', 'Payout profile updated successfully.');
    } catch (error) {
      Alert.alert('Save failed', getErrorMessage(error, 'Please review the payout details and try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>HOST PAYOUTS</Text>
          <Text style={styles.title}>Where venue earnings should settle.</Text>
          <Text style={styles.subtitle}>Fill UPI or bank details so the payout profile stays ready for settlement.</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Payout details</Text>

          <Input
            label="Account Holder Name"
            value={form.account_holder_name}
            onChangeText={value => setForm(current => ({ ...current, account_holder_name: value }))}
          />
          <Input
            label="UPI ID"
            value={form.upi_id}
            onChangeText={value => setForm(current => ({ ...current, upi_id: value }))}
            placeholder="name@bank"
          />
          <Input
            label="Bank Account Number"
            value={form.bank_account_number}
            onChangeText={value => setForm(current => ({ ...current, bank_account_number: value }))}
            keyboardType="number-pad"
          />
          <Input
            label="IFSC Code"
            value={form.ifsc_code}
            autoCapitalize="characters"
            onChangeText={value => setForm(current => ({ ...current, ifsc_code: value.toUpperCase() }))}
          />
          <Input
            label="Bank Name"
            value={form.bank_name}
            onChangeText={value => setForm(current => ({ ...current, bank_name: value }))}
          />
          <Input
            label="Branch Name"
            value={form.branch_name}
            onChangeText={value => setForm(current => ({ ...current, branch_name: value }))}
          />

          <Button
            title={loading ? 'Loading...' : 'Save Payout Profile'}
            onPress={handleSave}
            isLoading={saving}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.m,
    paddingBottom: 120,
  },
  heroCard: {
    marginTop: theme.spacing.s,
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
    ...theme.shadows.soft,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
    marginBottom: theme.spacing.l,
  },
});
