import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../utils/theme';

interface GroundProps {
  ground: any;
  onPress: () => void;
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop';

export const GroundCard: React.FC<GroundProps> = ({ ground, onPress }) => {
  const imageUri = ground.images?.length > 0 ? ground.images[0].image : DEFAULT_IMAGE;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>{ground.name}</Text>
          <View style={styles.ratingBadge}>
            <Icon name="star" size={14} color={theme.colors.warning} />
            <Text style={styles.ratingText}>{ground.avg_rating || 'New'}</Text>
          </View>
        </View>

        <Text style={styles.location} numberOfLines={1}>
          <Icon name="location-outline" size={14} color={theme.colors.textMuted} /> {ground.city}, {ground.state}
        </Text>

        <View style={styles.detailsRow}>
          <View style={styles.typeTag}>
            <Text style={styles.typeText}>{ground.ground_type}</Text>
          </View>
          <Text style={styles.price}>
            Starting at <Text style={styles.priceBold}>₹{ground.price || '500'}/hr</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.l,
    marginBottom: theme.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: theme.colors.backgroundLight,
  },
  content: {
    padding: theme.spacing.m,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  name: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
    flex: 1,
    marginRight: theme.spacing.s,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.s,
  },
  ratingText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.textMain,
    marginLeft: 4,
  },
  location: {
    ...theme.typography.bodyS,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.s,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  typeTag: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.pill,
  },
  typeText: {
    ...theme.typography.caption,
    color: theme.colors.primaryDark,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  price: {
    ...theme.typography.bodyS,
    color: theme.colors.textMuted,
  },
  priceBold: {
    fontWeight: '700',
    color: theme.colors.textMain,
  },
});
