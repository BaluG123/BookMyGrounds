import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../utils/theme';
import { bookingsAPI } from '../../api/bookings';

export default function AdminBookingsScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await bookingsAPI.adminBookings();
      setRequests(res.data.results || res.data);
    } catch (e) {
      console.log('Error fetching Admin requests', e);
    } finally {
      setLoading(false);
    }
  };

  const renderBooking = ({ item }: { item: any }) => {
    const confirmed = item.status === 'confirmed';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.customerBlock}>
            <Text style={styles.customerName}>{item.customer_name || 'Customer'}</Text>
            <Text style={styles.details}>Turf: {item.ground?.name || 'Unknown turf'}</Text>
          </View>
          <View style={[styles.statusPill, confirmed ? styles.confirmedPill : styles.pendingPill]}>
            <Text style={[styles.statusText, confirmed ? styles.confirmedText : styles.pendingText]}>
              {item.status?.toUpperCase() || 'PENDING'}
            </Text>
          </View>
        </View>
        <Text style={styles.metaLine}>
          {item.booking_date} at {item.start_time?.substring(0, 5)}
        </Text>
      </View>
    );
  };

  return (
    <ScreenContainer>
      <FlatList
        data={requests}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>REQUESTS</Text>
            <Text style={styles.title}>Booking pipeline at a glance.</Text>
            <Text style={styles.subtitle}>Review every incoming request in a calmer, easier-to-scan layout.</Text>
          </View>
        }
        renderItem={renderBooking}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No booking requests</Text>
              <Text style={styles.emptyText}>Fresh requests will land here as customers start booking.</Text>
            </View>
          )
        }
        refreshing={loading}
        onRefresh={fetchRequests}
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
  customerBlock: {
    flex: 1,
    marginRight: theme.spacing.m,
  },
  customerName: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
    marginBottom: 4,
  },
  details: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
  },
  metaLine: {
    ...theme.typography.bodyS,
    color: theme.colors.textSoft,
    marginTop: theme.spacing.m,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.pill,
  },
  confirmedPill: {
    backgroundColor: '#D9FBF3',
  },
  pendingPill: {
    backgroundColor: '#FFF1D6',
  },
  statusText: {
    ...theme.typography.caption,
  },
  confirmedText: {
    color: theme.colors.success,
  },
  pendingText: {
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
