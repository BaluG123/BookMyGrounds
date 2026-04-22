import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../utils/theme';
import { bookingsAPI } from '../../api/bookings';
import { getErrorMessage } from '../../utils/error';
import { Button } from '../../components/Button';

export default function AdminBookingDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const bookingId = route.params?.bookingId;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<'confirm' | 'complete' | 'cancel' | null>(null);

  const fetchBooking = useCallback(async () => {
    try {
      setLoading(true);
      const res = await bookingsAPI.detail(bookingId);
      setBooking(res.data);
    } catch (error) {
      Alert.alert('Unable to load booking', getErrorMessage(error, 'Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBooking();
    });
    return unsubscribe;
  }, [navigation, fetchBooking]);

  const handleAction = async (action: 'confirm' | 'complete' | 'cancel') => {
    try {
      setSubmitting(action);
      if (action === 'confirm') {
        await bookingsAPI.confirm(bookingId);
      } else if (action === 'complete') {
        await bookingsAPI.complete(bookingId);
      } else {
        await bookingsAPI.cancel(bookingId);
      }
      await fetchBooking();
    } catch (error) {
      Alert.alert('Action failed', getErrorMessage(error, 'Unable to update this booking.'));
    } finally {
      setSubmitting(null);
    }
  };

  if (loading || !booking) {
    return (
      <ScreenContainer style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>ADMIN BOOKING</Text>
          <Text style={styles.title}>{booking.ground_name}</Text>
          <Text style={styles.subtitle}>
            #{booking.booking_number} • {booking.booking_date} • {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <Text style={styles.infoText}>Name: {booking.customer_name || booking.customer_info?.full_name}</Text>
          <Text style={styles.infoText}>Phone: {booking.customer_phone || 'Not provided'}</Text>
          <Text style={styles.infoText}>Players: {booking.player_count || 1}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Status & payment</Text>
          <Text style={styles.infoText}>Booking: {booking.status_display || booking.status}</Text>
          <Text style={styles.infoText}>Payment: {booking.payment_status_display || booking.payment_status}</Text>
          <Text style={styles.infoText}>Total: ₹{booking.total_amount}</Text>
          <Text style={styles.infoText}>Outstanding: ₹{booking.outstanding_amount}</Text>
        </View>

        {booking.booked_slots?.length > 1 ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Booked slots</Text>
            {booking.booked_slots.map((item: any) => (
              <Text key={item.id || item.time_slot?.id} style={styles.infoText}>
                {item.time_slot?.start_time?.slice(0, 5)} - {item.time_slot?.end_time?.slice(0, 5)}
              </Text>
            ))}
          </View>
        ) : null}

        {booking.notes || booking.special_requests ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Notes</Text>
            {booking.notes ? <Text style={styles.infoText}>Notes: {booking.notes}</Text> : null}
            {booking.special_requests ? <Text style={styles.infoText}>Requests: {booking.special_requests}</Text> : null}
          </View>
        ) : null}

        {booking.can_confirm ? (
          <Button
            title="Confirm Booking"
            onPress={() => handleAction('confirm')}
            isLoading={submitting === 'confirm'}
            style={styles.actionButton}
          />
        ) : null}
        {booking.can_complete ? (
          <Button
            title="Mark Completed"
            variant="outline"
            onPress={() => handleAction('complete')}
            isLoading={submitting === 'complete'}
            style={styles.actionButton}
          />
        ) : null}
        {booking.can_cancel ? (
          <Button
            title="Cancel Booking"
            variant="text"
            onPress={() => handleAction('cancel')}
            isLoading={submitting === 'cancel'}
            textStyle={styles.cancelText}
          />
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: theme.spacing.m,
    paddingBottom: 120,
  },
  heroCard: {
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginTop: theme.spacing.s,
    marginBottom: theme.spacing.l,
    ...theme.shadows.strong,
  },
  eyebrow: {
    ...theme.typography.caption,
    color: '#9CCAFF',
    marginBottom: theme.spacing.s,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.white,
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    ...theme.typography.bodyM,
    color: '#B3C7DC',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.l,
    ...theme.shadows.soft,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
    marginBottom: theme.spacing.m,
  },
  infoText: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.s,
  },
  actionButton: {
    marginBottom: theme.spacing.m,
  },
  cancelText: {
    color: theme.colors.error,
  },
});
