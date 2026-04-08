import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../utils/theme';
import { bookingsAPI } from '../../api/bookings';
import Icon from 'react-native-vector-icons/Ionicons';
import { GroundCard } from '../../components/GroundCard';

export default function DashboardScreen() {
  const [stats, setStats] = useState({ revenue: 0, bookingsCompleted: 0, pendingRequests: 0 });

  useEffect(() => {
    // In a real app we would call a specific dashboard endpoint, but here we estimate
    setStats({
      revenue: 14500,
      bookingsCompleted: 24,
      pendingRequests: 5,
    });
  }, []);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Admin Dashboard</Text>
        
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.primaryLight }]}>
            <Icon name="cash-outline" size={24} color={theme.colors.primaryDark} />
            <Text style={styles.statValue}>₹{stats.revenue}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E0F2FE' }]}>
            <Icon name="calendar-outline" size={24} color="#0369A1" />
            <Text style={styles.statValue}>{stats.bookingsCompleted}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.m,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textMain,
    marginBottom: theme.spacing.l,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 0.48,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    alignItems: 'center',
  },
  statValue: {
    ...theme.typography.h2,
    color: theme.colors.textMain,
    marginTop: theme.spacing.s,
  },
  statLabel: {
    ...theme.typography.bodyS,
    color: theme.colors.textMuted,
  },
});
