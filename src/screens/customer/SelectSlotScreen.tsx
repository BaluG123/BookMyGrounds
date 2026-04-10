import React, { useEffect, useMemo, useState } from 'react';
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
import Icon from 'react-native-vector-icons/Ionicons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../utils/theme';
import { Button } from '../../components/Button';
import { bookingsAPI } from '../../api/bookings';
import { groundsAPI } from '../../api/grounds';
import { getErrorMessage } from '../../utils/error';
import { useAppSelector } from '../../store';

function formatDateLabel(date: Date) {
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatDateValue(date: Date) {
  return date.toISOString().split('T')[0];
}

function formatTimeLabel(time?: string) {
  if (!time) return '--:--';
  return time.slice(0, 5);
}

function resolveMatchingPricingPlan(ground: any, slot: any) {
  const pricingPlans = ground?.pricing_plans || [];
  const start = slot?.start_time;
  const end = slot?.end_time;

  if (!start || !end) {
    return null;
  }

  const startHour = Number(start.slice(0, 2));
  const startMinute = Number(start.slice(3, 5));
  const endHour = Number(end.slice(0, 2));
  const endMinute = Number(end.slice(3, 5));
  const durationHours = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / 60;

  return (
    pricingPlans.find((plan: any) => Number(plan.duration_hours) === durationHours && plan.is_active) ||
    pricingPlans.find((plan: any) => plan.duration_type === 'per_hour' && plan.is_active) ||
    null
  );
}

export default function SelectSlotScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAppSelector(state => state.auth);
  const groundId = route.params?.groundId;

  const [ground, setGround] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(formatDateValue(new Date()));

  const dateOptions = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index);
        return {
          label: formatDateLabel(date),
          value: formatDateValue(date),
        };
      }),
    [],
  );

  useEffect(() => {
    if (!groundId) {
      Alert.alert('Missing turf', 'No turf was selected.');
      navigation.goBack();
      return;
    }
    fetchGround();
  }, [groundId, navigation]);

  useEffect(() => {
    if (!groundId) {
      return;
    }
    fetchSlots(selectedDate);
  }, [groundId, selectedDate]);

  const fetchGround = async () => {
    try {
      const res = await groundsAPI.detail(groundId);
      setGround(res.data);
    } catch (error) {
      Alert.alert('Unable to load turf', getErrorMessage(error, 'Please try again.'));
    }
  };

  const fetchSlots = async (date: string) => {
    try {
      setLoading(true);
      setSelectedSlot(null);
      const res = await bookingsAPI.listSlots(groundId, date);
      setSlots(res.data.results || res.data || []);
    } catch (error) {
      setSlots([]);
      Alert.alert('Unable to load slots', getErrorMessage(error, 'Please refresh and try again.'));
    } finally {
      setLoading(false);
    }
  };

  const selectedSlotData = slots.find(slot => slot.id === selectedSlot);
  const matchedPricingPlan = selectedSlotData ? resolveMatchingPricingPlan(ground, selectedSlotData) : null;

  const handleReserve = async () => {
    if (!ground || !selectedSlotData) {
      return;
    }

    try {
      setSubmitting(true);
      if (!matchedPricingPlan) {
        Alert.alert(
          'Pricing missing',
          'This turf does not have an active pricing plan for the selected slot duration. Add a pricing plan first, then try again.',
        );
        return;
      }

      const response = await bookingsAPI.create({
        ground: ground.id,
        time_slot: selectedSlotData.id,
        pricing_plan: matchedPricingPlan.id,
        booking_date: selectedDate,
        start_time: selectedSlotData.start_time,
        end_time: selectedSlotData.end_time,
        customer_name: user?.full_name || '',
        customer_phone: user?.phone || '',
        player_count: 1,
        notes: '',
        special_requests: '',
      });

      const booking = response.data;

      Alert.alert(
        'Booking created',
        `Your slot on ${booking.booking_date} from ${formatTimeLabel(booking.start_time)} to ${formatTimeLabel(
          booking.end_time,
        )} has been reserved.`,
        [
          {
            text: 'Pay now',
            onPress: () => navigation.navigate('Payment', { bookingId: booking.id }),
          },
          {
            text: 'Later',
            onPress: () => navigation.navigate('MainTabs', { screen: 'Bookings' }),
          },
        ],
      );
    } catch (error) {
      Alert.alert('Booking failed', getErrorMessage(error, 'Unable to reserve this slot right now.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Icon name="arrow-back" size={24} color={theme.colors.textMain} onPress={() => navigation.goBack()} />
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Select Time Slot</Text>
          <Text style={styles.subtitleTop}>{ground?.name || 'Choose your match window'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>BOOKING DATE</Text>
          <Text style={styles.heroTitle}>Pick the day, then lock the slot.</Text>
          <Text style={styles.heroText}>
            Live availability is loaded from the backend for each date below.
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
          {dateOptions.map(option => {
            const active = option.value === selectedDate;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.dateChip, active && styles.dateChipActive]}
                onPress={() => setSelectedDate(option.value)}
                activeOpacity={0.88}>
                <Text style={[styles.dateChipText, active && styles.dateChipTextActive]}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.subtitle}>Available Slots</Text>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : slots.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No slots available</Text>
            <Text style={styles.emptyText}>Try a different date or come back after the owner opens more timings.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {slots.map(slot => {
              const isAvailable = slot.is_bookable;
              const isSelected = selectedSlot === slot.id;

              return (
                <Button
                  key={slot.id}
                  title={`${formatTimeLabel(slot.start_time)} - ${formatTimeLabel(slot.end_time)}`}
                  variant={isSelected ? 'primary' : isAvailable ? 'outline' : 'text'}
                  disabled={!isAvailable}
                  style={[styles.slotBtn, !isAvailable && styles.slotBtnDisabled]}
                  onPress={() => setSelectedSlot(slot.id)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerSummary}>
          <Text style={styles.footerLabel}>Selected</Text>
          <Text style={styles.footerValue}>
            {selectedSlotData
              ? `${formatTimeLabel(selectedSlotData.start_time)} - ${formatTimeLabel(selectedSlotData.end_time)}`
              : 'Choose a slot to continue'}
          </Text>
          {selectedSlotData ? (
            <Text style={styles.footerHint}>
              {matchedPricingPlan
                ? `Pricing plan: ${matchedPricingPlan.duration_display || matchedPricingPlan.duration_type}`
                : 'No active pricing plan found for this slot duration.'}
            </Text>
          ) : null}
        </View>
        <Button
          title="Reserve Slot"
          disabled={!selectedSlot || !matchedPricingPlan}
          isLoading={submitting}
          onPress={handleReserve}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerCopy: {
    marginLeft: theme.spacing.m,
    flex: 1,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textMain,
  },
  subtitleTop: {
    ...theme.typography.bodyS,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  content: {
    padding: theme.spacing.m,
    paddingBottom: theme.spacing.xl,
  },
  heroCard: {
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.l,
    ...theme.shadows.strong,
  },
  eyebrow: {
    ...theme.typography.caption,
    color: '#9CCAFF',
    marginBottom: theme.spacing.s,
  },
  heroTitle: {
    ...theme.typography.h2,
    color: theme.colors.white,
    marginBottom: theme.spacing.s,
  },
  heroText: {
    ...theme.typography.bodyM,
    color: '#B3C7DC',
  },
  dateRow: {
    paddingBottom: theme.spacing.m,
  },
  dateChip: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: theme.spacing.s,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dateChipText: {
    ...theme.typography.bodyS,
    color: theme.colors.textMain,
  },
  dateChipTextActive: {
    color: theme.colors.white,
  },
  subtitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.m,
    color: theme.colors.textMain,
  },
  grid: {
    flexDirection: 'column',
  },
  slotBtn: {
    marginBottom: theme.spacing.m,
  },
  slotBtnDisabled: {
    backgroundColor: theme.colors.backgroundLight,
  },
  loader: {
    marginTop: theme.spacing.xl,
  },
  emptyState: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
    marginBottom: theme.spacing.s,
  },
  emptyText: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  footer: {
    padding: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  footerSummary: {
    marginBottom: theme.spacing.m,
  },
  footerLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSoft,
    marginBottom: 2,
  },
  footerValue: {
    ...theme.typography.bodyM,
    color: theme.colors.textMain,
  },
  footerHint: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
});
