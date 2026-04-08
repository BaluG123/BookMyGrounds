import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../utils/theme';
import { GroundCard } from '../../components/GroundCard';
import { groundsAPI } from '../../api/grounds';
import { useNavigation } from '@react-navigation/native';

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
      <View style={styles.header}>
        <Text style={styles.title}>Saved Turfs</Text>
      </View>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <GroundCard 
            ground={item.ground} // Assuming the API returns {id, ground: {id, name...}}
            onPress={() => navigation.navigate('GroundDetail', { id: item.ground?.id })} 
          />
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            <Text style={styles.emptyText}>You haven't saved any turfs yet.</Text>
          )
        }
        refreshing={loading}
        onRefresh={fetchFavorites}
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
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xl,
    ...theme.typography.bodyM,
  },
});
