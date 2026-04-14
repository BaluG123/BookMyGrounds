import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../utils/theme';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { groundsAPI } from '../../api/grounds';
import { getErrorMessage } from '../../utils/error';

type PricingForm = {
  duration_hours: string;
  price: string;
  weekend_price: string;
};

const EMPTY_FORM: PricingForm = {
  duration_hours: '1',
  price: '',
  weekend_price: '',
};

export default function ManagePricingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const groundId = route.params?.groundId;
  const groundName = route.params?.ground?.name;

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PricingForm>(EMPTY_FORM);

  const fetchPricing = useCallback(async () => {
    try {
      setLoading(true);
      const res = await groundsAPI.listPricing(groundId);
      setPlans(res.data.results || res.data || []);
    } catch (error) {
      setPlans([]);
      Alert.alert('Unable to load pricing', getErrorMessage(error, 'Please refresh and try again.'));
    } finally {
      setLoading(false);
    }
  }, [groundId]);

  useEffect(() => {
    if (!groundId) {
      Alert.alert('Missing turf', 'No turf was selected.');
      navigation.goBack();
      return;
    }

    fetchPricing();
  }, [fetchPricing, groundId, navigation]);

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleEdit = (plan: any) => {
    setEditingId(plan.id);
    setForm({
      duration_hours: String(plan.duration_hours || ''),
      price: String(plan.price || ''),
      weekend_price: plan.weekend_price ? String(plan.weekend_price) : '',
    });
  };

  const handleSave = async () => {
    const durationHours = Number(form.duration_hours);
    const price = Number(form.price);
    const weekendPrice = form.weekend_price ? Number(form.weekend_price) : undefined;

    if (!durationHours || durationHours <= 0) {
      Alert.alert('Invalid duration', 'Enter a slot duration in hours greater than zero.');
      return;
    }

    if (!price || price <= 0) {
      Alert.alert('Invalid price', 'Enter a valid weekday price.');
      return;
    }

    if (weekendPrice !== undefined && weekendPrice <= 0) {
      Alert.alert('Invalid weekend price', 'Weekend price must be greater than zero.');
      return;
    }

    const payload = {
      duration_hours: durationHours,
      duration_type: durationHours === 1 ? 'per_hour' : 'custom',
      price,
      weekend_price: weekendPrice,
      is_active: true,
    };

    try {
      setSaving(true);
      if (editingId) {
        await groundsAPI.updatePricing(groundId, editingId, payload);
      } else {
        await groundsAPI.addPricing(groundId, payload);
      }
      await fetchPricing();
      resetForm();
      Alert.alert('Pricing saved', 'The pricing plan is now available for customer bookings.');
    } catch (error) {
      Alert.alert('Save failed', getErrorMessage(error, 'Unable to save this pricing plan.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (planId: string) => {
    try {
      setDeletingId(planId);
      await groundsAPI.deletePricing(groundId, planId);
      setPlans(current => current.filter(plan => plan.id !== planId));
      if (editingId === planId) {
        resetForm();
      }
    } catch (error) {
      Alert.alert('Delete failed', getErrorMessage(error, 'Unable to delete this pricing plan.'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>PRICING CONTROL</Text>
          <Text style={styles.title}>Set what each slot should cost.</Text>
          <Text style={styles.subtitle}>
            {groundName || 'This turf'} needs an active pricing plan before customers can complete a booking.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>{editingId ? 'Edit pricing plan' : 'Add pricing plan'}</Text>
          <Input
            label="Duration (hours)"
            value={form.duration_hours}
            onChangeText={value => setForm(current => ({ ...current, duration_hours: value }))}
            keyboardType="decimal-pad"
            placeholder="1"
          />
          <Input
            label="Weekday Price"
            value={form.price}
            onChangeText={value => setForm(current => ({ ...current, price: value }))}
            keyboardType="decimal-pad"
            placeholder="500"
          />
          <Input
            label="Weekend Price"
            value={form.weekend_price}
            onChangeText={value => setForm(current => ({ ...current, weekend_price: value }))}
            keyboardType="decimal-pad"
            placeholder="Optional"
          />
          <View style={styles.formActions}>
            <Button
              title={editingId ? 'Update Pricing' : 'Add Pricing'}
              onPress={handleSave}
              isLoading={saving}
              style={styles.primaryAction}
            />
            {editingId ? (
              <Button title="Cancel Edit" onPress={resetForm} variant="outline" style={styles.secondaryAction} />
            ) : null}
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Existing plans</Text>
          <Text style={styles.sectionCopy}>Customers can only book slots that match one of these active durations.</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : plans.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No pricing plans yet</Text>
            <Text style={styles.emptyText}>Add at least one pricing plan so the booking flow can calculate slot prices.</Text>
          </View>
        ) : (
          plans.map(plan => (
            <View key={plan.id} style={styles.planCard}>
              <View style={styles.planHeader}>
                <View>
                  <Text style={styles.planDuration}>{plan.duration_display || `${plan.duration_hours} hour slot`}</Text>
                  <Text style={styles.planMeta}>
                    Weekday: ₹{plan.price}
                    {plan.weekend_price ? `  •  Weekend: ₹${plan.weekend_price}` : ''}
                  </Text>
                </View>
                <View style={[styles.statusPill, plan.is_active ? styles.activePill : styles.inactivePill]}>
                  <Text style={[styles.statusText, plan.is_active ? styles.activeText : styles.inactiveText]}>
                    {plan.is_active ? 'ACTIVE' : 'OFF'}
                  </Text>
                </View>
              </View>

              <View style={styles.planActions}>
                <Button title="Edit" variant="outline" onPress={() => handleEdit(plan)} style={styles.smallAction} />
                <TouchableOpacity
                  onPress={() => handleDelete(plan.id)}
                  disabled={deletingId === plan.id}
                  activeOpacity={0.85}>
                  <Text style={styles.deleteText}>{deletingId === plan.id ? 'Deleting...' : 'Delete'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
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
    marginBottom: theme.spacing.l,
    ...theme.shadows.soft,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
    marginBottom: theme.spacing.m,
  },
  formActions: {
    marginTop: theme.spacing.s,
    gap: theme.spacing.s,
  },
  primaryAction: {
    width: '100%',
  },
  secondaryAction: {
    width: '100%',
  },
  listHeader: {
    marginBottom: theme.spacing.m,
  },
  sectionCopy: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
  },
  loader: {
    marginTop: theme.spacing.xl,
  },
  emptyState: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
    marginBottom: theme.spacing.s,
  },
  emptyText: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
  },
  planCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.m,
    ...theme.shadows.soft,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.m,
  },
  planDuration: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
    marginBottom: theme.spacing.xs,
  },
  planMeta: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.pill,
  },
  activePill: {
    backgroundColor: theme.colors.success + '18',
  },
  inactivePill: {
    backgroundColor: theme.colors.textSoft + '18',
  },
  statusText: {
    ...theme.typography.caption,
    fontWeight: '700',
  },
  activeText: {
    color: theme.colors.success,
  },
  inactiveText: {
    color: theme.colors.textMuted,
  },
  planActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.l,
  },
  smallAction: {
    minWidth: 120,
  },
  deleteText: {
    ...theme.typography.bodyM,
    color: theme.colors.error,
    fontWeight: '700',
  },
});
