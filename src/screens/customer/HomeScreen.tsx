import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { GroundCard } from '../../components/GroundCard';
import { NotificationBell } from '../../components/NotificationBell';
import { theme, getGreeting, sportColors } from '../../utils/theme';
import { AppDispatch, RootState } from '../../store';
import { groundsAPI } from '../../api/grounds';
import { setGroundsList, setLoading } from '../../store/slices/groundsSlice';

const SPORT_FILTERS = [
  { key: 'all', label: 'All', icon: '🏟️' },
  { key: 'cricket', label: 'Cricket', icon: '🏏' },
  { key: 'football', label: 'Football', icon: '⚽' },
  { key: 'badminton', label: 'Badminton', icon: '🏸' },
  { key: 'tennis', label: 'Tennis', icon: '🎾' },
  { key: 'basketball', label: 'Basketball', icon: '🏀' },
  { key: 'hockey', label: 'Hockey', icon: '🏑' },
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { groundsList, isLoading } = useSelector((state: RootState) => state.grounds);
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeSport, setActiveSport] = useState('all');

  const fetchGrounds = useCallback(async (sportFilter?: string) => {
    try {
      dispatch(setLoading(true));
      const params: any = { ordering: '-avg_rating' };
      if (sportFilter && sportFilter !== 'all') {
        params.ground_type = sportFilter;
      }
      const res = await groundsAPI.list(params);
      dispatch(setGroundsList(res.data.results || res.data));
    } catch (e) {
      console.log('Error fetching grounds', e);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchGrounds(activeSport);
  }, [fetchGrounds, activeSport]);

  // Refresh on screen focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchGrounds(activeSport);
    });
    return unsubscribe;
  }, [navigation, fetchGrounds, activeSport]);

  const handleSportFilter = (key: string) => {
    setActiveSport(key);
  };

  const greeting = getGreeting();
  const firstName = user?.full_name?.split(' ')[0] || 'Player';
  const initials = user?.full_name
    ?.split(' ')
    .slice(0, 2)
    .map((part: string) => part[0])
    .join('')
    .toUpperCase() || 'BG';

  const featuredCount = groundsList.length;

  const renderHeader = () => (
    <View>
      {/* Greeting Header */}
      <View style={styles.greetingRow}>
        <View style={styles.greetingLeft}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.greetingCopy}>
            <Text style={styles.greetingLabel}>
              {greeting.text} {greeting.emoji}
            </Text>
            <Text style={styles.greetingName}>{firstName}</Text>
          </View>
        </View>
        <NotificationBell />
      </View>

      {/* Hero Card */}
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>YOUR PLAYBOOK</Text>
        <Text style={styles.heroTitle}>Find your next winning turf.</Text>
        <Text style={styles.heroSubtitle}>
          Curated venues, premium surfaces, and smoother bookings — all in one place.
        </Text>

        <View style={styles.heroMetrics}>
          <View style={styles.metricCard}>
            <Icon name="football-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.metricValue}>{featuredCount}</Text>
            <Text style={styles.metricLabel}>Venues live</Text>
          </View>
          <View style={styles.metricCard}>
            <Icon name="flash-outline" size={18} color={theme.colors.secondary} />
            <Text style={styles.metricValue}>Instant</Text>
            <Text style={styles.metricLabel}>Book & pay</Text>
          </View>
          <View style={styles.metricCard}>
            <Icon name="shield-checkmark-outline" size={18} color={theme.colors.accent} />
            <Text style={styles.metricValue}>Secure</Text>
            <Text style={styles.metricLabel}>Razorpay</Text>
          </View>
        </View>
      </View>

      {/* Sport Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sportFilterRow}
      >
        {SPORT_FILTERS.map(sport => {
          const active = activeSport === sport.key;
          return (
            <TouchableOpacity
              key={sport.key}
              style={[styles.sportChip, active && styles.sportChipActive]}
              onPress={() => handleSportFilter(sport.key)}
              activeOpacity={0.85}
            >
              <Text style={styles.sportChipIcon}>{sport.icon}</Text>
              <Text style={[styles.sportChipText, active && styles.sportChipTextActive]}>
                {sport.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {activeSport === 'all' ? 'Trending grounds' : `${SPORT_FILTERS.find(s => s.key === activeSport)?.label || ''} venues`}
        </Text>
        <Text style={styles.sectionCopy}>
          {activeSport === 'all'
            ? 'Handpicked for quality, reviews, and availability.'
            : `Showing ${featuredCount} ${activeSport} venue${featuredCount !== 1 ? 's' : ''}`}
        </Text>
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
              <Icon name="telescope-outline" size={36} color={theme.colors.primary} />
              <Text style={styles.emptyTitle}>No venues found</Text>
              <Text style={styles.emptyText}>
                {activeSport !== 'all'
                  ? `No ${activeSport} venues available yet. Try "All" to discover more.`
                  : 'Pull to refresh and check again for newly listed grounds.'}
              </Text>
            </View>
          )
        }
        refreshing={isLoading}
        onRefresh={() => fetchGrounds(activeSport)}
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
  // Greeting
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.s,
    marginBottom: theme.spacing.m,
  },
  greetingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.m,
  },
  avatarText: {
    ...theme.typography.bodyM,
    color: theme.colors.white,
    fontWeight: '700',
  },
  greetingCopy: {},
  greetingLabel: {
    ...theme.typography.bodyS,
    color: theme.colors.textMuted,
  },
  greetingName: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
    marginTop: 2,
  },
  // Hero
  heroCard: {
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.m,
    ...theme.shadows.strong,
  },
  eyebrow: {
    ...theme.typography.caption,
    color: '#9CCAFF',
    marginBottom: theme.spacing.s,
  },
  heroTitle: {
    ...theme.typography.h1,
    color: theme.colors.white,
    marginBottom: theme.spacing.s,
  },
  heroSubtitle: {
    ...theme.typography.bodyM,
    color: '#B3C7DC',
  },
  heroMetrics: {
    flexDirection: 'row',
    marginTop: theme.spacing.xl,
    gap: theme.spacing.s,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
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
  // Sport Filters
  sportFilterRow: {
    paddingBottom: theme.spacing.m,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginRight: theme.spacing.s,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sportChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  sportChipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  sportChipText: {
    ...theme.typography.bodyS,
    color: theme.colors.textMain,
  },
  sportChipTextActive: {
    color: theme.colors.white,
  },
  // Section
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
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  emptyText: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
