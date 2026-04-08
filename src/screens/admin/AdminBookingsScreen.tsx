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

  const renderBooking = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.groundName}>{item.customer_name || 'Customer'}</Text>
      <Text style={styles.details}>Turf: {item.ground?.name}</Text>
      <Text style={styles.details}>Date: {item.booking_date} | {item.start_time?.substring(0,5)}</Text>
      <Text style={[styles.status, { color: item.status === 'confirmed' ? theme.colors.success : theme.colors.warning }]}>
        {item.status?.toUpperCase() || 'PENDING'}
      </Text>
    </View>
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Booking Requests</Text>
      </View>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={renderBooking}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            <Text style={styles.emptyText}>No booking requests found.</Text>
          )
        }
        refreshing={loading}
        onRefresh={fetchRequests}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: theme.spacing.m,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textMain,
  },
  listContainer: {
    padding: theme.spacing.m,
    paddingTop: 0,
  },
  card: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  groundName: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
    marginBottom: 4,
  },
  details: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  status: {
    ...theme.typography.caption,
    fontWeight: '700',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xl,
    ...theme.typography.bodyM,
  },
});
