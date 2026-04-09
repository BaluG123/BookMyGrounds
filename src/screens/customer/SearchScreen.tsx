import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Input } from '../../components/Input';
import { theme } from '../../utils/theme';
import { GroundCard } from '../../components/GroundCard';
import { groundsAPI } from '../../api/grounds';

export default function SearchScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    try {
      const res = await groundsAPI.list({ search });
      setResults(res.data.results || res.data);
    } catch (e) {
      console.log('Search error', e);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>DISCOVER</Text>
          <Text style={styles.title}>Search by venue, city, or vibe.</Text>
          <Text style={styles.subtitle}>Pinpoint the perfect turf without digging through clutter.</Text>
        </View>

        <View style={styles.searchCard}>
          <Input
            placeholder="Search turfs, cities..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            leftIcon={<Icon name="search-outline" size={20} color={theme.colors.textSoft} />}
          />
          <Text style={styles.hint}>Press search on the keyboard to fetch results.</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{results.length > 0 ? 'Search results' : 'Start exploring'}</Text>
          <Text style={styles.sectionCopy}>
            {results.length > 0
              ? `${results.length} venues matched your search.`
              : 'Try a turf name, neighborhood, or city to begin.'}
          </Text>
        </View>

        {results.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="compass-outline" size={28} color={theme.colors.primary} />
            <Text style={styles.emptyTitle}>Search for a standout venue</Text>
            <Text style={styles.emptyText}>Results will appear here with the refreshed card layout.</Text>
          </View>
        ) : (
          results.map(ground => (
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
  hint: {
    ...theme.typography.caption,
    color: theme.colors.textSoft,
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
