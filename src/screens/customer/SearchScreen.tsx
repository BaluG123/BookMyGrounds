import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Input } from '../../components/Input';
import { theme } from '../../utils/theme';
import { GroundCard } from '../../components/GroundCard';
import { groundsAPI } from '../../api/grounds';

const SPORT_FILTERS = [
  { key: 'all', label: 'All', icon: '🏟️' },
  { key: 'cricket', label: 'Cricket', icon: '🏏' },
  { key: 'football', label: 'Football', icon: '⚽' },
  { key: 'badminton', label: 'Badminton', icon: '🏸' },
  { key: 'tennis', label: 'Tennis', icon: '🎾' },
  { key: 'basketball', label: 'Basketball', icon: '🏀' },
];

export default function SearchScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [popularGrounds, setPopularGrounds] = useState<any[]>([]);
  const [activeSport, setActiveSport] = useState('all');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load popular grounds on mount
  useEffect(() => {
    fetchPopular();
  }, []);

  const fetchPopular = async () => {
    try {
      const res = await groundsAPI.list({ ordering: '-avg_rating', page_size: 5 });
      setPopularGrounds(res.data.results || res.data || []);
    } catch (e) {
      console.log('Error fetching popular grounds', e);
    }
  };

  const executeSearch = useCallback(async (query: string, sportType: string) => {
    if (!query.trim() && sportType === 'all') {
      setResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      const params: any = {};
      if (query.trim()) params.search = query.trim();
      if (sportType !== 'all') params.ground_type = sportType;

      const res = await groundsAPI.list(params);
      setResults(res.data.results || res.data || []);
    } catch (e) {
      console.log('Search error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search as user types
  const handleSearchChange = (text: string) => {
    setSearch(text);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      executeSearch(text, activeSport);
    }, 500);
  };

  const handleSportFilter = (key: string) => {
    setActiveSport(key);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    executeSearch(search, key);
  };

  const displayResults = hasSearched ? results : popularGrounds;
  const showingPopular = !hasSearched;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>DISCOVER</Text>
          <Text style={styles.title}>Search by venue, city, or sport.</Text>
          <Text style={styles.subtitle}>Find the perfect turf without digging through clutter.</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchCard}>
          <Input
            placeholder="Search turfs, cities..."
            value={search}
            onChangeText={handleSearchChange}
            onSubmitEditing={() => executeSearch(search, activeSport)}
            returnKeyType="search"
            leftIcon={<Icon name="search-outline" size={20} color={theme.colors.textSoft} />}
          />

          {/* Sport Filters */}
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
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {showingPopular ? '🔥 Popular venues' : `${results.length} result${results.length !== 1 ? 's' : ''} found`}
          </Text>
          <Text style={styles.sectionCopy}>
            {showingPopular
              ? 'Top-rated grounds to get you started.'
              : search.trim()
                ? `Matching "${search.trim()}"${activeSport !== 'all' ? ` in ${activeSport}` : ''}`
                : `Showing ${activeSport} venues`}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : displayResults.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="compass-outline" size={32} color={theme.colors.primary} />
            <Text style={styles.emptyTitle}>
              {hasSearched ? 'No venues found' : 'Search for a standout venue'}
            </Text>
            <Text style={styles.emptyText}>
              {hasSearched
                ? 'Try different keywords or remove filters.'
                : 'Results will appear here with the refreshed card layout.'}
            </Text>
          </View>
        ) : (
          displayResults.map(ground => (
            <GroundCard
              key={ground.id}
              ground={ground}
              onPress={() => navigation.navigate('GroundDetail', { id: ground.id })}
            />
          ))
        )}
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
  searchCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.l,
    ...theme.shadows.soft,
  },
  sportFilterRow: {
    marginTop: theme.spacing.m,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginRight: theme.spacing.s,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sportChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  sportChipIcon: {
    fontSize: 14,
    marginRight: 5,
  },
  sportChipText: {
    ...theme.typography.caption,
    color: theme.colors.textMain,
  },
  sportChipTextActive: {
    color: theme.colors.white,
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
    marginTop: 4,
  },
  loader: {
    marginTop: theme.spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
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
