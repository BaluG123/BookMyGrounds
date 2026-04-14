import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../utils/theme';

interface GroundProps {
  ground: any;
  onPress: () => void;
}

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop';

export const GroundCard: React.FC<GroundProps> = ({ ground, onPress }) => {
  let imageUri = DEFAULT_IMAGE;

  if (ground?.primary_image) {
    imageUri = ground.primary_image;
  } else if (ground?.images?.length > 0) {
    imageUri = ground.images[0].image;
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <View style={styles.imageOverlay}>
        <View style={styles.topRow}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>
              {ground?.ground_type_display || ground?.ground_type || 'Turf'}
            </Text>
          </View>
          {ground?.verification_status && ground?.verification_status !== 'approved' ? (
            <View
              style={[
                styles.statusBadge,
                ground?.verification_status === 'rejected' ? styles.statusRejected : styles.statusPending,
              ]}>
              <Text style={styles.statusBadgeText}>
                {ground?.verification_status_display || ground?.verification_status}
              </Text>
            </View>
          ) : (
            <View style={styles.ratingBadge}>
              <Icon name="star" size={14} color={theme.colors.accent} />
              <Text style={styles.ratingText}>{ground?.avg_rating || 'New'}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {ground?.name || 'Premium Turf'}
        </Text>
        <View style={styles.locationRow}>
          <Icon name="location-outline" size={15} color={theme.colors.textSoft} />
          <Text style={styles.location} numberOfLines={1}>
            {ground?.city || 'City'}, {ground?.state || 'State'}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.priceLabel}>Starting from</Text>
            <Text style={styles.priceValue}>
              {ground?.min_price?.amount ? `₹${ground.min_price.amount}` : 'On request'}
            </Text>
          </View>
          <View style={styles.ctaPill}>
            <Text style={styles.ctaText}>View</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.l,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    ...theme.shadows.strong,
  },
  image: {
    width: '100%',
    height: 210,
    backgroundColor: theme.colors.backgroundAlt,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.m,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryPill: {
    backgroundColor: 'rgba(7, 17, 31, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.pill,
  },
  categoryText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    textTransform: 'capitalize',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.pill,
  },
  ratingText: {
    ...theme.typography.caption,
    color: theme.colors.textMain,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.pill,
  },
  statusPending: {
    backgroundColor: 'rgba(255,209,102,0.92)',
  },
  statusRejected: {
    backgroundColor: 'rgba(255,107,107,0.92)',
  },
  statusBadgeText: {
    ...theme.typography.caption,
    color: theme.colors.textMain,
    fontWeight: '700',
  },
  content: {
    padding: theme.spacing.m,
  },
  name: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
    marginBottom: theme.spacing.s,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  location: {
    ...theme.typography.bodyS,
    color: theme.colors.textMuted,
    marginLeft: 6,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSoft,
  },
  priceValue: {
    ...theme.typography.h3,
    color: theme.colors.primaryDark,
  },
  ctaPill: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.pill,
  },
  ctaText: {
    ...theme.typography.bodyS,
    color: theme.colors.primaryDark,
  },
});
