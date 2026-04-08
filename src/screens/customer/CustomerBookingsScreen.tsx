import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../utils/theme';
import { bookingsAPI } from '../../api/bookings';

export default function CustomerBookingsScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

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

  const renderBooking = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.groundName}>{item.ground?.name || 'Turf Booking'}</Text>
      <Text style={styles.details}>Date: {item.booking_date}</Text>
      <Text style={styles.details}>Time: {item.start_time?.substring(0,5)} - {item.end_time?.substring(0,5)}</Text>
      <Text style={[styles.status, { color: item.status === 'confirmed' ? theme.colors.success : theme.colors.warning }]}>
        {item.status?.toUpperCase() || 'PENDING'}
      </Text>
    </View>
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
      </View>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={renderBooking}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            <Text style={styles.emptyText}>You don't have any bookings yet.</Text>
          )
        }
        refreshing={loading}
        onRefresh={fetchBookings}
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
    ...theme.typography.bodyS,
    color: theme.colors.textMuted,
    marginBottom: 2,
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
