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

const AMENITY_QUICK_ICONS: Record<string, { icon: string; label: string }> = {
  parking: { icon: 'car-outline', label: 'Parking' },
  floodlights: { icon: 'flashlight-outline', label: 'Lights' },
  changing_room: { icon: 'shirt-outline', label: 'Changing' },
  drinking_water: { icon: 'water-outline', label: 'Water' },
  washroom: { icon: 'water-outline', label: 'Washroom' },
  wifi: { icon: 'wifi-outline', label: 'WiFi' },
  cafeteria: { icon: 'cafe-outline', label: 'Cafe' },
};

export const GroundCard: React.FC<GroundProps> = ({ ground, onPress }) => {
  let imageUri = DEFAULT_IMAGE;

  if (ground?.primary_image) {
    imageUri = ground.primary_image;
  } else if (ground?.images?.length > 0) {
    imageUri = ground.images[0].image;
  }

  // Extract first 3 amenity icons
  const amenities = ground?.amenities || ground?.amenity_details || [];
  const quickAmenities = amenities
    .slice(0, 3)
    .map((amenity: any) => {
      const name = (typeof amenity === 'string' ? amenity : amenity?.name || '').toLowerCase().replace(/\s+/g, '_');
      return AMENITY_QUICK_ICONS[name] || null;
    })
    .filter(Boolean);

  const isVerified = ground?.verification_status === 'approved';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        {/* Gradient overlay for badges */}
        <View style={styles.imageGradientTop} />

        <View style={styles.imageOverlay}>
          <View style={styles.topRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>
                {ground?.ground_type_display || ground?.ground_type || 'Turf'}
              </Text>
            </View>
            <View style={styles.topRight}>
              {isVerified && (
                <View style={styles.verifiedBadge}>
                  <Icon name="checkmark-circle" size={13} color={theme.colors.white} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
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
        </View>

        {/* Surface type badge at bottom of image */}
        {(ground?.surface_type_display || ground?.surface_type) && (
          <View style={styles.surfaceBadge}>
            <Icon name="layers-outline" size={12} color={theme.colors.white} />
            <Text style={styles.surfaceText}>
              {ground?.surface_type_display || ground?.surface_type}
            </Text>
          </View>
        )}
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

        {/* Quick Amenity Icons */}
        {quickAmenities.length > 0 && (
          <View style={styles.amenityRow}>
            {quickAmenities.map((amenity: any, index: number) => (
              <View key={index} style={styles.amenityMini}>
                <Icon name={amenity.icon} size={13} color={theme.colors.textSoft} />
                <Text style={styles.amenityMiniText}>{amenity.label}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.priceLabel}>Starting from</Text>
            <Text style={styles.priceValue}>
              {ground?.min_price?.amount ? `₹${ground.min_price.amount}` : 'On request'}
            </Text>
          </View>
          <View style={styles.ctaPill}>
            <Text style={styles.ctaText}>Book</Text>
            <Icon name="arrow-forward" size={14} color={theme.colors.primaryDark} />
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
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 210,
    backgroundColor: theme.colors.backgroundAlt,
  },
  imageGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.3)',
    opacity: 0.7,
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
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,184,148,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.pill,
    gap: 4,
  },
  verifiedText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontSize: 11,
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
  surfaceBadge: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.pill,
    gap: 4,
  },
  surfaceText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontSize: 11,
    textTransform: 'capitalize',
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
    marginBottom: theme.spacing.s,
  },
  location: {
    ...theme.typography.bodyS,
    color: theme.colors.textMuted,
    marginLeft: 6,
    flex: 1,
  },
  amenityRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.m,
    gap: theme.spacing.m,
  },
  amenityMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amenityMiniText: {
    ...theme.typography.caption,
    color: theme.colors.textSoft,
    fontSize: 11,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.pill,
    gap: 6,
  },
  ctaText: {
    ...theme.typography.bodyS,
    color: theme.colors.primaryDark,
    fontWeight: '600',
  },
});
