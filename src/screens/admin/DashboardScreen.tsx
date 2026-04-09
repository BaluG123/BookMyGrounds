import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../utils/theme';
import { bookingsAPI } from '../../api/bookings';
import { groundsAPI } from '../../api/grounds';
import { getErrorMessage } from '../../utils/error';
import { Button } from '../../components/Button';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState({
    revenue: 0,
    bookingsCompleted: 0,
    pendingRequests: 0,
    totalGrounds: 0,
    averageRating: 0,
    totalReviews: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [groundsRes, bookingsRes] = await Promise.all([
        groundsAPI.myGrounds(),
        bookingsAPI.adminBookings(),
      ]);

      const grounds = groundsRes.data.results || groundsRes.data || [];
      const bookings = bookingsRes.data.results || bookingsRes.data || [];

      const completedBookings = bookings.filter((booking: any) => booking.status === 'completed' || booking.status === 'confirmed');
      const pendingBookings = bookings.filter((booking: any) => booking.status === 'pending');
      const revenue = completedBookings.reduce((sum: number, booking: any) => {
        const amount = Number(
          booking.total_amount ||
            booking.amount ||
            booking.slot_price ||
            booking.pricing_plan?.price ||
            0,
        );
        return sum + (Number.isFinite(amount) ? amount : 0);
      }, 0);
      const ratings = grounds
        .map((ground: any) => Number(ground.avg_rating || 0))
        .filter((rating: number) => Number.isFinite(rating) && rating > 0);
      const totalReviews = grounds.reduce((sum: number, ground: any) => sum + Number(ground.total_reviews || 0), 0);

      setStats({
        revenue,
        bookingsCompleted: completedBookings.length,
        pendingRequests: pendingBookings.length,
        totalGrounds: grounds.length,
        averageRating: ratings.length ? Number((ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length).toFixed(1)) : 0,
        totalReviews,
      });
    } catch (error) {
      Alert.alert('Dashboard unavailable', getErrorMessage(error, 'Unable to load live dashboard data.'));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchDashboardData} tintColor={theme.colors.primary} />
        }>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>HOST CONSOLE</Text>
          <Text style={styles.title}>Run your venue with a stronger presence.</Text>
          <Text style={styles.subtitle}>Track live performance, bookings, and demand from one polished dashboard.</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.primaryCard]}>
            <Icon name="cash-outline" size={24} color={theme.colors.white} />
            <Text style={styles.primaryValue}>₹{stats.revenue}</Text>
            <Text style={styles.primaryLabel}>Estimated revenue</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="calendar-outline" size={22} color={theme.colors.primary} />
            <Text style={styles.statValue}>{stats.bookingsCompleted}</Text>
            <Text style={styles.statLabel}>Completed bookings</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="hourglass-outline" size={22} color={theme.colors.accent} />
            <Text style={styles.statValue}>{stats.pendingRequests}</Text>
            <Text style={styles.statLabel}>Pending requests</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="football-outline" size={22} color={theme.colors.primary} />
            <Text style={styles.statValue}>{stats.totalGrounds}</Text>
            <Text style={styles.statLabel}>Active venues</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="star-outline" size={22} color={theme.colors.accent} />
            <Text style={styles.statValue}>{stats.averageRating || '0.0'}</Text>
            <Text style={styles.statLabel}>Average rating</Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Today's focus</Text>
          <Text style={styles.insightText}>
            {stats.pendingRequests > 0
              ? `You have ${stats.pendingRequests} pending request${stats.pendingRequests > 1 ? 's' : ''}. Respond quickly to improve conversion.`
              : 'No pending requests right now. Focus on promoting your highest-rated slots and keeping availability current.'}
          </Text>
          <View style={styles.actionRow}>
            <Button title="Notifications" variant="outline" onPress={() => navigation.navigate('Notifications')} style={styles.actionBtn} />
            <Button title="Payouts" variant="outline" onPress={() => navigation.navigate('PayoutProfile')} style={styles.actionBtn} />
          </View>
        </View>
        <View style={styles.insightRow}>
          <View style={styles.microInsight}>
            <Text style={styles.microLabel}>Reviews collected</Text>
            <Text style={styles.microValue}>{stats.totalReviews}</Text>
          </View>
          <View style={styles.microInsight}>
            <Text style={styles.microLabel}>Conversion-ready</Text>
            <Text style={styles.microValue}>{stats.bookingsCompleted + stats.pendingRequests}</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
  statsGrid: {
    gap: theme.spacing.m,
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    ...theme.shadows.soft,
  },
  primaryCard: {
    backgroundColor: theme.colors.primary,
  },
  primaryValue: {
    ...theme.typography.h1,
    color: theme.colors.white,
    marginTop: theme.spacing.m,
  },
  primaryLabel: {
    ...theme.typography.bodyM,
    color: '#DCE7FF',
    marginTop: 4,
  },
  statValue: {
    ...theme.typography.h2,
    color: theme.colors.textMain,
    marginTop: theme.spacing.m,
  },
  statLabel: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  insightCard: {
    backgroundColor: '#E9FFF7',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    marginTop: theme.spacing.l,
  },
  insightTitle: {
    ...theme.typography.h3,
    color: theme.colors.primaryDark,
    marginBottom: theme.spacing.s,
  },
  insightText: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.m,
    marginTop: theme.spacing.l,
  },
  actionBtn: {
    flex: 1,
  },
  insightRow: {
    flexDirection: 'row',
    gap: theme.spacing.m,
    marginTop: theme.spacing.l,
  },
  microInsight: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    ...theme.shadows.soft,
  },
  microLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSoft,
  },
  microValue: {
    ...theme.typography.h2,
    color: theme.colors.textMain,
    marginTop: theme.spacing.s,
  },
});
