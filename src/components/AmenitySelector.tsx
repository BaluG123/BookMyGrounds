import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { groundsAPI } from '../api/grounds';
import { theme } from '../utils/theme';
import Icon from 'react-native-vector-icons/Ionicons';

interface AmenitySelectorProps {
  selectedIds: number[];
  onSelect: (ids: number[]) => void;
}

export const AmenitySelector: React.FC<AmenitySelectorProps> = ({ selectedIds, onSelect }) => {
  const [amenities, setAmenities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      const res = await groundsAPI.amenities();
      setAmenities(res.data);
    } catch (e) {
      console.log('Error fetching amenities', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleAmenity = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelect(selectedIds.filter((item) => item !== id));
    } else {
      onSelect([...selectedIds, id]);
    }
  };

  if (loading) return <ActivityIndicator color={theme.colors.primary} style={{ margin: 20 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Amenities</Text>
      <View style={styles.list}>
        {amenities.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.item,
                isSelected && styles.itemSelected
              ]}
              onPress={() => toggleAmenity(item.id)}
            >
              <Icon 
                name={isSelected ? 'checkbox' : 'square-outline'} 
                size={18} 
                color={isSelected ? theme.colors.white : theme.colors.textMuted} 
              />
              <Text style={[
                styles.itemText,
                isSelected && styles.itemTextSelected
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.m,
  },
  label: {
    ...theme.typography.bodyS,
    color: theme.colors.textMain,
    fontWeight: '600',
    marginBottom: theme.spacing.s,
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  itemSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  itemText: {
    ...theme.typography.bodyS,
    color: theme.colors.textMain,
    marginLeft: 6,
  },
  itemTextSelected: {
    color: theme.colors.white,
    fontWeight: '600',
  },
});
