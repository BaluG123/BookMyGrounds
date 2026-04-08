import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Input } from '../../components/Input';
import { theme } from '../../utils/theme';
import { GroundCard } from '../../components/GroundCard';
import { groundsAPI } from '../../api/grounds';
import Icon from 'react-native-vector-icons/Ionicons';

export default function SearchScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!search.trim()) return;
    try {
      const res = await groundsAPI.list({ search });
      setResults(res.data.results || res.data);
    } catch (e) {
      console.log('Search error', e);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Input
          placeholder="Search turfs, cities..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          leftIcon={<Icon name="search-outline" size={20} color={theme.colors.textMuted} />}
          style={styles.inputStyle}
        />
      </View>
      
      <ScrollView contentContainerStyle={styles.resultsContainer}>
        {results.length === 0 ? (
          <Text style={styles.noResults}>Search for a turf by name or city</Text>
        ) : (
          results.map((ground) => (
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
  header: {
    padding: theme.spacing.m,
    paddingBottom: 0,
  },
  inputStyle: {
    flex: 1,
  },
  resultsContainer: {
    padding: theme.spacing.m,
  },
  noResults: {
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    color: theme.colors.textMuted,
    ...theme.typography.bodyM,
  },
});
