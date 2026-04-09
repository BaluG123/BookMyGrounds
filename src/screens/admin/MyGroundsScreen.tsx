import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { GroundCard } from '../../components/GroundCard';
import { groundsAPI } from '../../api/grounds';
import { theme } from '../../utils/theme';
import { Button } from '../../components/Button';

export default function MyGroundsScreen() {
  const navigation = useNavigation<any>();
  const [grounds, setGrounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyGrounds();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMyGrounds();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchMyGrounds = async () => {
    try {
      setLoading(true);
      const res = await groundsAPI.myGrounds();
      setGrounds(res.data.results || res.data);
    } catch (e) {
      console.log('Error fetching my grounds', e);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerBlock}>
      <Text style={styles.eyebrow}>MY TURFS</Text>
      <Text style={styles.title}>Manage your listed venues.</Text>
      <Text style={styles.subtitle}>Everything you host should feel premium and easy to maintain.</Text>
      <Button title="Add Turf" onPress={() => navigation.navigate('AddGround')} style={styles.addBtn} />
    </View>
  );

  return (
    <ScreenContainer>
      <FlatList
        data={grounds}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <GroundCard ground={item} onPress={() => navigation.navigate('GroundDetail', { groundId: item.id })} />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No turfs listed yet</Text>
              <Text style={styles.emptyText}>Create your first turf to start receiving bookings.</Text>
            </View>
          )
        }
        refreshing={loading}
        onRefresh={fetchMyGrounds}
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
  headerBlock: {
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
    marginBottom: theme.spacing.l,
  },
  addBtn: {
    alignSelf: 'flex-start',
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
