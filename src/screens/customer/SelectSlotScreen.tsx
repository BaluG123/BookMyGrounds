import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { getDisplayAmount, getDurationLabel, getEffectivePlanPrice, formatTime12h, getMultiSlotPrice } from '../../utils/pricing';
import { Input } from '../../components/Input';

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
  return formatTime12h(time);
}

function sortSlotsByTime(slots: any[]) {
  return [...slots].sort((first, second) => first.start_time.localeCompare(second.start_time));
}

function calcDurationHours(start: string, end: string): number {
  const startHour = Number(start.slice(0, 2));
  const startMinute = Number(start.slice(3, 5));
  const endHour = Number(end.slice(0, 2));
  const endMinute = Number(end.slice(3, 5));
  return ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / 60;
}

function resolveMatchingPricingPlan(ground: any, slot: any) {
  const pricingPlans = ground?.pricing_plans || [];
  const start = slot?.start_time;
  const end = slot?.end_time;

  if (!start || !end) {
    return { plan: null, totalDurationHours: 0 };
  }

  const durationHours = calcDurationHours(start, end);

  // First: try an exact duration match
  const exactMatch = pricingPlans.find(
    (plan: any) => Number(plan.duration_hours) === durationHours && plan.is_active
  );
  if (exactMatch) {
    return { plan: exactMatch, totalDurationHours: durationHours };
  }

  // Second: fall back to a per_hour plan (we'll multiply price × durationHours)
  const perHourPlan = pricingPlans.find(
    (plan: any) => plan.duration_type === 'per_hour' && plan.is_active
  );
  if (perHourPlan) {
    return { plan: perHourPlan, totalDurationHours: durationHours };
  }

  return { plan: null, totalDurationHours: durationHours };
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
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(formatDateValue(new Date()));
  const [promoCode, setPromoCode] = useState('');
  const [referralCode, setReferralCode] = useState('');

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

  const fetchGround = useCallback(async () => {
    try {
      const res = await groundsAPI.detail(groundId);
      setGround(res.data);
    } catch (error) {
      Alert.alert('Unable to load turf', getErrorMessage(error, 'Please try again.'));
    }
  }, [groundId]);

  const fetchSlots = useCallback(async (date: string) => {
    try {
      setLoading(true);
      setSelectedSlots([]);
      const res = await bookingsAPI.listSlots(groundId, date);
      setSlots(res.data.results || res.data || []);
    } catch (error) {
      setSlots([]);
      Alert.alert('Unable to load slots', getErrorMessage(error, 'Please refresh and try again.'));
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
    fetchGround();
  }, [fetchGround, groundId, navigation]);

  useEffect(() => {
    if (!groundId) {
      return;
    }
    fetchSlots(selectedDate);
  }, [fetchSlots, groundId, selectedDate]);

  const selectedSlotData = sortSlotsByTime(
    slots.filter(slot => selectedSlots.includes(slot.id))
  );
  const selectedSlotRange = selectedSlotData.length > 0 ? {
    start_time: selectedSlotData[0].start_time,
    end_time: selectedSlotData[selectedSlotData.length - 1].end_time,
  } : null;
  const { plan: matchedPricingPlan, totalDurationHours } = selectedSlotRange
    ? resolveMatchingPricingPlan(ground, selectedSlotRange)
    : { plan: null, totalDurationHours: 0 };
  const selectedSlotPrice = getMultiSlotPrice(matchedPricingPlan, totalDurationHours, selectedDate);

  const handleSlotToggle = (slot: any) => {
    if (!slot?.is_bookable) {
      return;
    }

    setSelectedSlots(current => {
      if (current.length === 0) {
        return [slot.id];
      }

      const selectedData = sortSlotsByTime(slots.filter(item => current.includes(item.id)));
      const firstSelected = selectedData[0];
      const lastSelected = selectedData[selectedData.length - 1];
      const isAlreadySelected = current.includes(slot.id);

      if (isAlreadySelected) {
        if (selectedData.length === 1) {
          return [];
        }
        if (slot.id === firstSelected.id) {
          return selectedData.slice(1).map(item => item.id);
        }
        if (slot.id === lastSelected.id) {
          return selectedData.slice(0, -1).map(item => item.id);
        }
        return [slot.id];
      }

      if (slot.end_time === firstSelected.start_time) {
        return [slot.id, ...selectedData.map(item => item.id)];
      }

      if (lastSelected.end_time === slot.start_time) {
        return [...selectedData.map(item => item.id), slot.id];
      }

      return [slot.id];
    });
  };

  const handleReserve = async () => {
    if (!ground || selectedSlotData.length === 0) {
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

      // 100 INR Minimum Check
      const estimatedPrice = getEffectivePlanPrice(matchedPricingPlan, selectedDate);
      
      if (Number(estimatedPrice || 0) < 100) {
        Alert.alert(
          'Minimum Amount Required',
          'The selected slot does not meet the minimum booking amount of ₹100. Please contact the ground owner or select a longer duration.'
        );
        return;
      }

      const response = await bookingsAPI.create({
        ground: ground.id,
        time_slot: selectedSlotData[0].id,
        time_slots: selectedSlotData.map(slot => slot.id),
        pricing_plan: matchedPricingPlan.id,
        booking_date: selectedDate,
        start_time: selectedSlotData[0].start_time,
        end_time: selectedSlotData[selectedSlotData.length - 1].end_time,
        customer_name: user?.full_name || '',
        customer_phone: user?.phone || '',
        player_count: 1,
        notes: '',
        special_requests: '',
        promo_code: promoCode.trim().toUpperCase() || undefined,
        referral_code: referralCode.trim().toUpperCase() || undefined,
      });

      const booking = response.data;
      
      // Mandatory immediate navigation to payment
      navigation.replace('Payment', { bookingId: booking.id });
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
            Live availability is loaded from the backend for each date below. Tap adjacent slots to extend one booking window.
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
              const isSelected = selectedSlots.includes(slot.id);

              return (
                <Button
                  key={slot.id}
                  title={`${formatTimeLabel(slot.start_time)} - ${formatTimeLabel(slot.end_time)}`}
                  variant={isSelected ? 'primary' : isAvailable ? 'outline' : 'text'}
                  disabled={!isAvailable}
                  style={[styles.slotBtn, !isAvailable && styles.slotBtnDisabled]}
                  onPress={() => handleSlotToggle(slot)}
                />
              );
            })}
          </View>
        )}

        <View style={styles.offerCard}>
          <View style={styles.offerHeader}>
            <Icon name="pricetag-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.offerTitle}>Promo and referral</Text>
          </View>
          <Text style={styles.offerText}>
            Add a promo code for campaign pricing or a referral code if this booking is eligible for invite pricing.
          </Text>
          <Input
            label="Promo Code"
            value={promoCode}
            autoCapitalize="characters"
            onChangeText={value => setPromoCode(value.toUpperCase())}
            placeholder="SAVE500"
          />
          <Input
            label="Referral Code"
            value={referralCode}
            autoCapitalize="characters"
            onChangeText={value => setReferralCode(value.toUpperCase())}
            placeholder={user?.referral_code ? `Not your own code (${user.referral_code})` : 'BMGTEAM'}
            containerStyle={styles.offerInputLast}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerSummary}>
          <Text style={styles.footerLabel}>Selected</Text>
          <Text style={styles.footerValue}>
            {selectedSlotData.length > 0
              ? `${formatTimeLabel(selectedSlotData[0].start_time)} – ${formatTimeLabel(selectedSlotData[selectedSlotData.length - 1].end_time)}`
              : 'Choose a slot to continue'}
          </Text>
          {selectedSlotData.length > 0 ? (
            <Text style={styles.footerHint}>
              {matchedPricingPlan
                ? `${selectedSlotData.length} slot${selectedSlotData.length > 1 ? 's' : ''} • ${totalDurationHours}h • ${getDisplayAmount(selectedSlotPrice)}`
                : 'No active pricing plan found for this slot duration.'}
            </Text>
          ) : null}
          {promoCode.trim() || referralCode.trim() ? (
            <Text style={styles.footerOfferHint}>
              {promoCode.trim()
                ? `Promo: ${promoCode.trim().toUpperCase()}`
                : `Referral: ${referralCode.trim().toUpperCase()}`} will be validated before payment.
            </Text>
          ) : null}
        </View>
        <Button
          title={selectedSlotPrice ? `Reserve for ${getDisplayAmount(selectedSlotPrice)}` : 'Reserve Slot'}
          disabled={selectedSlotData.length === 0 || !matchedPricingPlan}
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
  offerCard: {
    marginTop: theme.spacing.l,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    ...theme.shadows.soft,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
    marginBottom: theme.spacing.s,
  },
  offerTitle: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
  },
  offerText: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.m,
  },
  offerInputLast: {
    marginBottom: 0,
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
  footerOfferHint: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
});
