import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../utils/theme';
import { authAPI } from '../../api/auth';
import { getErrorMessage } from '../../utils/error';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

const UPI_ID_REGEX = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const BANK_ACCOUNT_REGEX = /^\d{9,18}$/;

type PayoutForm = {
  account_holder_name: string;
  bank_account_number: string;
  ifsc_code: string;
  upi_id: string;
  bank_name: string;
  branch_name: string;
};

type PayoutErrors = Partial<Record<keyof PayoutForm, string>>;

const sanitizeForm = (form: PayoutForm): PayoutForm => ({
  account_holder_name: form.account_holder_name.trim(),
  bank_account_number: form.bank_account_number.replace(/\s+/g, ''),
  ifsc_code: form.ifsc_code.trim().toUpperCase(),
  upi_id: form.upi_id.trim().toLowerCase(),
  bank_name: form.bank_name.trim(),
  branch_name: form.branch_name.trim(),
});

const validateForm = (form: PayoutForm): PayoutErrors => {
  const errors: PayoutErrors = {};
  const hasUpi = Boolean(form.upi_id);
  const hasBankDetails = Boolean(form.bank_account_number || form.ifsc_code || form.bank_name || form.branch_name);

  if (!hasUpi && !hasBankDetails) {
    errors.upi_id = 'Add a valid UPI ID or complete bank details.';
  }

  if (hasUpi && !UPI_ID_REGEX.test(form.upi_id)) {
    errors.upi_id = 'Enter a valid UPI ID like name@bank.';
  }

  if (hasUpi && !form.account_holder_name) {
    errors.account_holder_name = 'Enter the payee name customers should see in UPI apps.';
  }

  if (hasBankDetails) {
    if (!form.account_holder_name) {
      errors.account_holder_name = 'Account holder name is required for bank payouts.';
    }
    if (!BANK_ACCOUNT_REGEX.test(form.bank_account_number)) {
      errors.bank_account_number = 'Enter a valid account number.';
    }
    if (!IFSC_REGEX.test(form.ifsc_code)) {
      errors.ifsc_code = 'Enter a valid IFSC code.';
    }
    if (!form.bank_name) {
      errors.bank_name = 'Bank name is required for bank payouts.';
    }
  }

  return errors;
};

export default function PayoutProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PayoutForm>({
    account_holder_name: '',
    bank_account_number: '',
    ifsc_code: '',
    upi_id: '',
    bank_name: '',
    branch_name: '',
  });
  const [errors, setErrors] = useState<PayoutErrors>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await authAPI.getPayoutProfile();
      setForm(sanitizeForm({
        account_holder_name: res.data.account_holder_name || '',
        bank_account_number: res.data.bank_account_number || '',
        ifsc_code: res.data.ifsc_code || '',
        upi_id: res.data.upi_id || '',
        bank_name: res.data.bank_name || '',
        branch_name: res.data.branch_name || '',
      }));
    } catch (error: any) {
      if (error?.response?.status === 404) {
        Alert.alert(
          'Payout profile unavailable',
          'The current backend deployment does not expose the payout-profile endpoint yet. The app path is correct, so this needs a backend deploy/update.',
        );
        return;
      }
      Alert.alert('Unable to load payout profile', getErrorMessage(error, 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const sanitized = sanitizeForm(form);
    const validationErrors = validateForm(sanitized);

    setForm(sanitized);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      Alert.alert('Invalid payout details', 'Fix the highlighted payout fields before saving.');
      return;
    }

    try {
      setSaving(true);
      await authAPI.updatePayoutProfile(sanitized);
      Alert.alert('Saved', 'Payout profile updated successfully.');
    } catch (error: any) {
      if (error?.response?.status === 404) {
        Alert.alert(
          'Payout profile unavailable',
          'The current backend deployment does not expose the payout-profile endpoint yet. Update the server and try again.',
        );
        return;
      }
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
          <Text style={styles.sectionHint}>The account holder name is used as the payee name shown inside Google Pay, PhonePe, and other UPI apps.</Text>

          <Input
            label="Account Holder Name"
            value={form.account_holder_name}
            error={errors.account_holder_name}
            onChangeText={value => {
              setErrors(current => ({ ...current, account_holder_name: undefined }));
              setForm(current => ({ ...current, account_holder_name: value }));
            }}
          />
          <Input
            label="UPI ID"
            value={form.upi_id}
            error={errors.upi_id}
            autoCapitalize="none"
            onChangeText={value => {
              setErrors(current => ({ ...current, upi_id: undefined }));
              setForm(current => ({ ...current, upi_id: value }));
            }}
            placeholder="name@bank"
          />
          <Input
            label="Bank Account Number"
            value={form.bank_account_number}
            error={errors.bank_account_number}
            onChangeText={value => {
              setErrors(current => ({ ...current, bank_account_number: undefined }));
              setForm(current => ({ ...current, bank_account_number: value }));
            }}
            keyboardType="number-pad"
          />
          <Input
            label="IFSC Code"
            value={form.ifsc_code}
            autoCapitalize="characters"
            error={errors.ifsc_code}
            onChangeText={value => {
              setErrors(current => ({ ...current, ifsc_code: undefined }));
              setForm(current => ({ ...current, ifsc_code: value.toUpperCase() }));
            }}
          />
          <Input
            label="Bank Name"
            value={form.bank_name}
            error={errors.bank_name}
            onChangeText={value => {
              setErrors(current => ({ ...current, bank_name: undefined }));
              setForm(current => ({ ...current, bank_name: value }));
            }}
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
  sectionHint: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.l,
  },
});
