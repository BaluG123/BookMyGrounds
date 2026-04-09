import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../utils/theme';
import { GroundCard } from '../../components/GroundCard';
import { groundsAPI } from '../../api/grounds';

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await groundsAPI.listFavorites();
      setFavorites(res.data.results || res.data);
    } catch (e) {
      console.log('Error fetching favorites', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <FlatList
        data={favorites}
        keyExtractor={item => item.id?.toString()}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>FAVORITES</Text>
            <Text style={styles.title}>Your saved shortlist.</Text>
            <Text style={styles.subtitle}>Keep the venues you love ready for the next booking.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <GroundCard
            ground={item.ground}
            onPress={() => navigation.navigate('GroundDetail', { id: item.ground?.id })}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No saved turfs</Text>
              <Text style={styles.emptyText}>Favorite venues will show up here once you start saving them.</Text>
            </View>
          )
        }
        refreshing={loading}
        onRefresh={fetchFavorites}
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
