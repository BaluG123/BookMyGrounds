import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { GroundCard } from '../../components/GroundCard';
import { groundsAPI } from '../../api/grounds';
import { theme } from '../../utils/theme';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/Button';

export default function MyGroundsScreen() {
  const navigation = useNavigation<any>();
  const [grounds, setGrounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyGrounds();
  }, []);

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
    <View style={styles.header}>
      <Text style={styles.title}>My Turfs</Text>
      <Button 
        title="Add Turf +" 
        onPress={() => console.log('Navigate to Add Ground')} 
        style={styles.addBtn}
      />
    </View>
  );

  return (
    <ScreenContainer>
      <FlatList
        data={grounds}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <GroundCard 
            ground={item} 
            onPress={() => console.log(`Manage ground ${item.id}`)} 
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            <Text style={styles.emptyText}>You haven't listed any turfs yet.</Text>
          )
        }
        refreshing={loading}
        onRefresh={fetchMyGrounds}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: theme.spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textMain,
  },
  addBtn: {
    height: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xl,
    ...theme.typography.bodyM,
  },
});
