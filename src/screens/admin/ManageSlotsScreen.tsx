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
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../utils/theme';
import { Button } from '../../components/Button';
import { bookingsAPI } from '../../api/bookings';
import { groundsAPI } from '../../api/grounds';
import { getErrorMessage } from '../../utils/error';

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

function toHourMinute(time?: string) {
  return (time || '00:00:00').slice(0, 5);
}

function buildHourlySlots(openingTime?: string, closingTime?: string) {
  const slots = [];
  const [startHour] = toHourMinute(openingTime).split(':').map(Number);
  const [endHour] = toHourMinute(closingTime).split(':').map(Number);

  for (let hour = startHour; hour < endHour; hour += 1) {
    const nextHour = hour + 1;
    slots.push({
      start_time: `${String(hour).padStart(2, '0')}:00`,
      end_time: `${String(nextHour).padStart(2, '0')}:00`,
    });
  }

  return slots;
}

export default function ManageSlotsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const groundId = route.params?.groundId;
  const initialGround = route.params?.ground;

  const [ground, setGround] = useState<any>(initialGround || null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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

    if (!initialGround) {
      fetchGround();
    }
  }, [fetchGround, groundId, initialGround, navigation]);

  useEffect(() => {
    if (!groundId) {
      return;
    }
    fetchSlots(selectedDate);
  }, [fetchSlots, groundId, selectedDate]);

  const handleGenerateSlots = async () => {
    if (!ground) {
      return;
    }

    try {
      setCreating(true);
      const generatedSlots = buildHourlySlots(ground.opening_time, ground.closing_time);
      if (generatedSlots.length === 0) {
        Alert.alert('Invalid timings', 'This turf does not have valid opening and closing hours.');
        return;
      }

      await bookingsAPI.createSlots({
        ground_id: ground.id,
        date: selectedDate,
        slots: generatedSlots,
      });

      await fetchSlots(selectedDate);
      Alert.alert('Slots ready', 'Hourly slots were generated for the selected day.');
    } catch (error) {
      Alert.alert('Failed to create slots', getErrorMessage(error, 'Please try again.'));
    } finally {
      setCreating(false);
    }
  };

  const handleToggleAvailability = async (slot: any) => {
    try {
      setUpdatingId(slot.id);
      await bookingsAPI.updateSlot(slot.id, { is_available: !slot.is_available });
      await fetchSlots(selectedDate);
    } catch (error) {
      Alert.alert('Update failed', getErrorMessage(error, 'Unable to update this slot.'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteSlot = async (slot: any) => {
    try {
      setDeletingId(slot.id);
      await bookingsAPI.deleteSlot(slot.id);
      setSlots(current => current.filter(item => item.id !== slot.id));
    } catch (error) {
      Alert.alert('Delete failed', getErrorMessage(error, 'Unable to delete this slot.'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>SLOT CONTROL</Text>
          <Text style={styles.title}>Manage Time Slots</Text>
          <Text style={styles.subtitle}>{ground?.name || 'Control hourly availability for this turf.'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Generate daily timings in one tap.</Text>
          <Text style={styles.heroText}>
            The app will create one-hour slots between the turf opening and closing time.
          </Text>
          <Button title="Generate Hourly Slots" onPress={handleGenerateSlots} isLoading={creating} />
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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Slots</Text>
          <Text style={styles.sectionCopy}>Toggle availability or remove unused slots before customers book them.</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : slots.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No slots for this day</Text>
            <Text style={styles.emptyText}>Generate hourly slots above to open the day for reservations.</Text>
          </View>
        ) : (
          slots.map(slot => {
            const disabled = updatingId === slot.id || deletingId === slot.id;
            return (
              <View key={slot.id} style={styles.slotCard}>
                <View style={styles.slotHeader}>
                  <View>
                    <Text style={styles.slotTime}>
                      {toHourMinute(slot.start_time)} - {toHourMinute(slot.end_time)}
                    </Text>
                    <Text style={styles.slotMeta}>
                      {slot.is_booked ? 'Booked' : slot.is_available ? 'Open for booking' : 'Marked unavailable'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      slot.is_booked ? styles.bookedPill : slot.is_available ? styles.availablePill : styles.closedPill,
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        slot.is_booked ? styles.bookedText : slot.is_available ? styles.availableText : styles.closedText,
                      ]}>
                      {slot.is_booked ? 'BOOKED' : slot.is_available ? 'OPEN' : 'OFF'}
                    </Text>
                  </View>
                </View>

                <View style={styles.slotActions}>
                  <Button
                    title={slot.is_available ? 'Mark Unavailable' : 'Make Available'}
                    variant="outline"
                    disabled={slot.is_booked || disabled}
                    onPress={() => handleToggleAvailability(slot)}
                    style={styles.actionButton}
                  />
                  <Button
                    title={deletingId === slot.id ? 'Deleting...' : 'Delete'}
                    variant="text"
                    disabled={slot.is_booked || disabled}
                    onPress={() => handleDeleteSlot(slot)}
                    textStyle={styles.deleteText}
                  />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.m,
    paddingTop: theme.spacing.s,
    paddingBottom: theme.spacing.m,
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
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
  },
  content: {
    paddingHorizontal: theme.spacing.m,
    paddingBottom: 120,
  },
  heroCard: {
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.l,
    ...theme.shadows.strong,
  },
  heroTitle: {
    ...theme.typography.h2,
    color: theme.colors.white,
    marginBottom: theme.spacing.s,
  },
  heroText: {
    ...theme.typography.bodyM,
    color: '#B3C7DC',
    marginBottom: theme.spacing.l,
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
  sectionHeader: {
    marginBottom: theme.spacing.m,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.textMain,
  },
  sectionCopy: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  loader: {
    marginTop: theme.spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
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
  slotCard: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.m,
    ...theme.shadows.soft,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.m,
  },
  slotTime: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
    marginBottom: 4,
  },
  slotMeta: {
    ...theme.typography.bodyS,
    color: theme.colors.textMuted,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.pill,
  },
  availablePill: {
    backgroundColor: '#D9FBF3',
  },
  availableText: {
    color: theme.colors.success,
  },
  closedPill: {
    backgroundColor: '#E7EEF7',
  },
  closedText: {
    color: theme.colors.textMuted,
  },
  bookedPill: {
    backgroundColor: '#FFF1D6',
  },
  bookedText: {
    color: '#B96B00',
  },
  statusText: {
    ...theme.typography.caption,
  },
  slotActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginRight: theme.spacing.m,
  },
  deleteText: {
    color: theme.colors.error,
  },
});
