import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../utils/theme';
import { bookingsAPI } from '../../api/bookings';
import { Button } from '../../components/Button';

export default function CustomerBookingsScreen() {
  const navigation = useNavigation<any>();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBookings();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingsAPI.list();
      setBookings(res.data.results || res.data);
    } catch (e) {
      console.log('Error fetching bookings', e);
    } finally {
      setLoading(false);
    }
  };

  const renderBooking = ({ item }: { item: any }) => {
    const confirmed = item.status === 'confirmed';
    const paymentPending = item.outstanding_amount && Number(item.outstanding_amount) > 0;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.92}
        onPress={() => navigation.navigate('CustomerBookingDetail', { bookingId: item.id })}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.groundName}>{item.ground_name || 'Turf Booking'}</Text>
            <Text style={styles.details}>
              {item.booking_date}
              {item.ground_city ? ` • ${item.ground_city}` : ''}
            </Text>
          </View>
          <View style={[styles.statusPill, confirmed ? styles.statusConfirmed : styles.statusPending]}>
            <Text style={[styles.statusText, confirmed ? styles.statusTextConfirmed : styles.statusTextPending]}>
              {item.status?.toUpperCase() || 'PENDING'}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Icon name="time-outline" size={16} color={theme.colors.textSoft} />
          <Text style={styles.metaText}>
            {item.start_time?.substring(0, 5)} - {item.end_time?.substring(0, 5)}
          </Text>
        </View>
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.amountLabel}>Outstanding</Text>
            <Text style={styles.amountValue}>₹{item.outstanding_amount || '0.00'}</Text>
          </View>
          {paymentPending ? (
            <Button title="Pay" onPress={() => navigation.navigate('Payment', { bookingId: item.id })} style={styles.payButton} />
          ) : (
            <View style={styles.paidPill}>
              <Text style={styles.paidText}>Paid</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <FlatList
        data={bookings}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>MY BOOKINGS</Text>
            <Text style={styles.title}>Keep every match on schedule.</Text>
            <Text style={styles.subtitle}>Your upcoming and completed reservations live here.</Text>
          </View>
        }
        renderItem={renderBooking}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptyText}>Once you reserve a slot, the details will show up here.</Text>
            </View>
          )
        }
        refreshing={loading}
        onRefresh={fetchBookings}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: theme.spacing.m,
    paddingBottom: 120,
  },
  header: {
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
  card: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.m,
    ...theme.shadows.soft,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  groundName: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
    marginBottom: 4,
  },
  details: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.m,
  },
  metaText: {
    ...theme.typography.bodyS,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.s,
  },
  footerRow: {
    marginTop: theme.spacing.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSoft,
  },
  amountValue: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
    marginTop: 2,
  },
  payButton: {
    minWidth: 110,
  },
  paidPill: {
    backgroundColor: '#D9FBF3',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.pill,
  },
  paidText: {
    ...theme.typography.bodyS,
    color: theme.colors.success,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.pill,
  },
  statusConfirmed: {
    backgroundColor: '#D9FBF3',
  },
  statusPending: {
    backgroundColor: '#FFF1D6',
  },
  statusText: {
    ...theme.typography.caption,
  },
  statusTextConfirmed: {
    color: theme.colors.success,
  },
  statusTextPending: {
    color: '#B96B00',
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
});
