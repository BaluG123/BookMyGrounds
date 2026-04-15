import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../utils/theme';
import { bookingsAPI } from '../../api/bookings';
import { Button } from '../../components/Button';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

function getRelativeDate(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bookDate = new Date(dateStr);
  bookDate.setHours(0, 0, 0, 0);
  const diff = Math.round((bookDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff <= 7) return `In ${diff} days`;
  if (diff < -1 && diff >= -7) return `${Math.abs(diff)} days ago`;
  return '';
}

export default function CustomerBookingsScreen() {
  const navigation = useNavigation<any>();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBookings();
    });
    return unsubscribe;
  }, [navigation, activeTab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (activeTab === 'upcoming') {
        params.status = 'confirmed';
        params.upcoming = true;
      } else if (activeTab === 'completed') {
        params.status = 'completed';
      } else if (activeTab === 'cancelled') {
        params.status = 'cancelled';
      }
      const res = await bookingsAPI.list(params);
      setBookings(res.data.results || res.data);
    } catch (e) {
      console.log('Error fetching bookings', e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed': return { bg: '#D9FBF3', text: theme.colors.success };
      case 'completed': return { bg: '#DDE9FF', text: theme.colors.primary };
      case 'cancelled': return { bg: '#FFE5E5', text: theme.colors.error };
      default: return { bg: '#FFF1D6', text: '#B96B00' };
    }
  };

  const renderBooking = ({ item }: { item: any }) => {
    const paymentPending = item.outstanding_amount && Number(item.outstanding_amount) > 0;
    const statusStyle = getStatusStyle(item.status);
    const relativeDate = getRelativeDate(item.booking_date || '');

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.92}
        onPress={() => navigation.navigate('CustomerBookingDetail', { bookingId: item.id })}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.groundName}>{item.ground_name || 'Turf Booking'}</Text>
            <View style={styles.dateRow}>
              <Icon name="calendar-outline" size={14} color={theme.colors.textSoft} />
              <Text style={styles.details}>
                {item.booking_date}
                {relativeDate ? ` · ${relativeDate}` : ''}
                {item.ground_city ? ` · ${item.ground_city}` : ''}
              </Text>
            </View>
          </View>
          <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {(item.status || 'pending').toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Icon name="time-outline" size={15} color={theme.colors.textSoft} />
            <Text style={styles.metaText}>
              {item.start_time?.substring(0, 5)} - {item.end_time?.substring(0, 5)}
            </Text>
          </View>
          {item.player_count ? (
            <View style={styles.metaChip}>
              <Icon name="people-outline" size={15} color={theme.colors.textSoft} />
              <Text style={styles.metaText}>{item.player_count} players</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.amountLabel}>
              {paymentPending ? 'Outstanding' : 'Total'}
            </Text>
            <Text style={styles.amountValue}>
              ₹{paymentPending ? item.outstanding_amount : item.total_amount || '0.00'}
            </Text>
          </View>
          {paymentPending ? (
            <Button
              title="Pay Now"
              onPress={() => navigation.navigate('Payment', { bookingId: item.id })}
              style={styles.payButton}
              icon={<Icon name="card-outline" size={16} color={theme.colors.white} />}
            />
          ) : item.status === 'completed' ? (
            <View style={styles.paidPill}>
              <Icon name="checkmark-circle" size={16} color={theme.colors.success} />
              <Text style={styles.paidText}>Paid</Text>
            </View>
          ) : null}
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
          <View>
            <View style={styles.header}>
              <Text style={styles.eyebrow}>MY BOOKINGS</Text>
              <Text style={styles.title}>Keep every match on schedule.</Text>
              <Text style={styles.subtitle}>Your upcoming and completed reservations live here.</Text>
            </View>

            {/* Status Tabs */}
            <View style={styles.tabRow}>
              {STATUS_TABS.map(tab => {
                const active = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.tabChip, active && styles.tabChipActive]}
                    onPress={() => setActiveTab(tab.key)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.tabChipText, active && styles.tabChipTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        }
        renderItem={renderBooking}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
          ) : (
            <View style={styles.emptyState}>
              <Icon
                name={activeTab === 'completed' ? 'trophy-outline' : activeTab === 'cancelled' ? 'close-circle-outline' : 'calendar-outline'}
                size={32}
                color={theme.colors.primary}
              />
              <Text style={styles.emptyTitle}>
                {activeTab === 'all' ? 'No bookings yet' :
                 activeTab === 'upcoming' ? 'No upcoming bookings' :
                 activeTab === 'completed' ? 'No completed bookings' :
                 'No cancelled bookings'}
              </Text>
              <Text style={styles.emptyText}>
                {activeTab === 'all'
                  ? 'Once you reserve a slot, the details will show up here.'
                  : `Switch to "All" to see your complete booking history.`}
              </Text>
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
    marginBottom: theme.spacing.m,
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
  // Tabs
  tabRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.l,
    gap: theme.spacing.s,
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabChipText: {
    ...theme.typography.bodyS,
    color: theme.colors.textMain,
  },
  tabChipTextActive: {
    color: theme.colors.white,
  },
  // Card
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
  cardHeaderLeft: {
    flex: 1,
    marginRight: theme.spacing.s,
  },
  groundName: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  details: {
    ...theme.typography.bodyS,
    color: theme.colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.m,
    gap: theme.spacing.m,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    ...theme.typography.bodyS,
    color: theme.colors.textMuted,
  },
  footerRow: {
    marginTop: theme.spacing.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
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
    minWidth: 120,
    minHeight: 46,
  },
  paidPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D9FBF3',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.pill,
    gap: 6,
  },
  paidText: {
    ...theme.typography.bodyS,
    color: theme.colors.success,
    fontWeight: '600',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.pill,
  },
  statusText: {
    ...theme.typography.caption,
    fontWeight: '700',
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
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  emptyText: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
