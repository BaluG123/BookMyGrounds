import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { GroundCard } from '../../components/GroundCard';
import { NotificationBell } from '../../components/NotificationBell';
import { theme } from '../../utils/theme';
import { AppDispatch, RootState } from '../../store';
import { groundsAPI } from '../../api/grounds';
import { setGroundsList, setLoading } from '../../store/slices/groundsSlice';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { groundsList, isLoading } = useSelector((state: RootState) => state.grounds);
  const { user } = useSelector((state: RootState) => state.auth);

  const fetchGrounds = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const res = await groundsAPI.list({ ordering: '-avg_rating' });
      dispatch(setGroundsList(res.data.results || res.data));
    } catch (e) {
      console.log('Error fetching grounds', e);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchGrounds();
  }, [fetchGrounds]);

  const featuredCount = groundsList.length;

  const renderHeader = () => (
    <View>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>TODAY'S PLAYBOOK</Text>
            <Text style={styles.greeting}>Hi {user?.full_name?.split(' ')[0] || 'Player'}, find your next winning turf.</Text>
            <Text style={styles.subtitle}>Curated venues, premium surfaces, and smoother bookings in one place.</Text>
          </View>
          <NotificationBell light />
        </View>

        <View style={styles.heroMetrics}>
          <View style={styles.metricCard}>
            <Icon name="sparkles-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.metricValue}>{featuredCount}</Text>
            <Text style={styles.metricLabel}>Top venues</Text>
          </View>
          <View style={styles.metricCard}>
            <Icon name="time-outline" size={18} color={theme.colors.secondary} />
            <Text style={styles.metricValue}>Fast</Text>
            <Text style={styles.metricLabel}>Booking flow</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trending grounds</Text>
        <Text style={styles.sectionCopy}>Handpicked for quality, reviews, and availability.</Text>
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      <FlatList
        data={groundsList}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <GroundCard ground={item} onPress={() => navigation.navigate('GroundDetail', { id: item.id })} />
        )}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No venues yet</Text>
              <Text style={styles.emptyText}>Pull to refresh and check again for newly listed grounds.</Text>
            </View>
          )
        }
        refreshing={isLoading}
        onRefresh={fetchGrounds}
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
  heroCard: {
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginTop: theme.spacing.s,
    marginBottom: theme.spacing.l,
    ...theme.shadows.strong,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.m,
  },
  heroCopy: {
    flex: 1,
  },
  eyebrow: {
    ...theme.typography.caption,
    color: '#9CCAFF',
    marginBottom: theme.spacing.s,
  },
  greeting: {
    ...theme.typography.h1,
    color: theme.colors.white,
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    ...theme.typography.bodyM,
    color: '#B3C7DC',
  },
  heroMetrics: {
    flexDirection: 'row',
    marginTop: theme.spacing.xl,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    marginRight: theme.spacing.m,
  },
  metricValue: {
    ...theme.typography.h3,
    color: theme.colors.white,
    marginTop: theme.spacing.s,
  },
  metricLabel: {
    ...theme.typography.caption,
    color: '#B3C7DC',
    marginTop: 2,
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
    marginTop: 2,
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
});
