import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { GroundCard } from '../../components/GroundCard';
import { theme } from '../../utils/theme';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { groundsAPI } from '../../api/grounds';
import { setGroundsList, setLoading } from '../../store/slices/groundsSlice';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { groundsList, isLoading } = useSelector((state: RootState) => state.grounds);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchGrounds();
  }, []);

  const fetchGrounds = async () => {
    try {
      dispatch(setLoading(true));
      const res = await groundsAPI.list({ ordering: '-avg_rating' });
      dispatch(setGroundsList(res.data.results || res.data));
    } catch (e) {
      console.log('Error fetching grounds', e);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.greeting}>Hello, {user?.full_name?.split(' ')[0] || 'Player'} 👋</Text>
      <Text style={styles.subtitle}>Find and book the best turfs nearby.</Text>
    </View>
  );

  return (
    <ScreenContainer>
      <FlatList
        data={groundsList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <GroundCard 
            ground={item} 
            onPress={() => navigation.navigate('GroundDetail', { id: item.id })}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <Text style={styles.emptyText}>No turfs available right now.</Text>
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
  },
  header: {
    marginBottom: theme.spacing.l,
    marginTop: theme.spacing.s,
  },
  greeting: {
    ...theme.typography.h2,
    color: theme.colors.textMain,
    marginBottom: 4,
  },
  subtitle: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xl,
    ...theme.typography.bodyL,
  },
});
