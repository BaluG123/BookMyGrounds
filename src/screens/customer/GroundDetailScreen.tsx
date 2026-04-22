import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, ActivityIndicator,
  Alert, TouchableOpacity, Dimensions, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../utils/theme';
import { groundsAPI } from '../../api/grounds';
import { reviewsAPI } from '../../api/reviews';
import { Button } from '../../components/Button';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getErrorMessage } from '../../utils/error';
import { openCoordinatesInGoogleMaps } from '../../utils/map';
import { getActivePricingPlans, getDisplayAmount, getGroundPriceHeadline } from '../../utils/pricing';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop';

const AMENITY_ICONS: Record<string, string> = {
  parking: 'car-outline',
  changing_room: 'shirt-outline',
  floodlights: 'flashlight-outline',
  drinking_water: 'water-outline',
  washroom: 'water-outline',
  first_aid: 'medkit-outline',
  cafeteria: 'cafe-outline',
  wifi: 'wifi-outline',
  seating: 'people-outline',
  scoreboard: 'stats-chart-outline',
  equipment: 'fitness-outline',
  shower: 'rainy-outline',
};

export default function GroundDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params;
  const scrollRef = useRef<ScrollView>(null);

  const [ground, setGround] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await groundsAPI.detail(id);
      setGround(res.data);
    } catch (error) {
      Alert.alert('Unable to load turf', getErrorMessage(error, 'Please refresh and try again.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await reviewsAPI.list(id);
      setReviews(res.data.results || res.data || []);
    } catch (error) {
      console.log('Failed to fetch reviews', error);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
    fetchReviews();
  }, [fetchDetail, fetchReviews]);

  const handleFavoriteToggle = async () => {
    if (!ground) {
      return;
    }

    try {
      setFavoriteLoading(true);
      if (ground.is_favorited) {
        const favoritesRes = await groundsAPI.listFavorites();
        const favorites = favoritesRes.data.results || favoritesRes.data || [];
        const currentFavorite = favorites.find((item: any) => item.ground?.id === ground.id);

        if (!currentFavorite) {
          throw new Error('Favorite entry not found.');
        }

        await groundsAPI.removeFavorite(currentFavorite.id);
        setGround((current: any) => ({ ...current, is_favorited: false }));
        return;
      }

      await groundsAPI.addFavorite(ground.id);
      setGround((current: any) => ({ ...current, is_favorited: true }));
    } catch (error) {
      Alert.alert('Favorite update failed', getErrorMessage(error, 'Please try again.'));
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleImageScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(xOffset / SCREEN_WIDTH);
    setActiveImageIndex(index);
  };

  if (loading || !ground) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ScreenContainer>
    );
  }

  const images = ground.images?.length > 0
    ? ground.images.map((img: any) => img.image)
    : [DEFAULT_IMAGE];
  const amenities = ground.amenities || ground.amenity_details || [];
  const activePricingPlans = getActivePricingPlans(ground);
  const priceHeadline = getGroundPriceHeadline(ground);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleImageScroll}
            scrollEventThrottle={16}
          >
            {images.map((uri: string, index: number) => (
              <Image key={index} source={{ uri }} style={styles.image} />
            ))}
          </ScrollView>

          {/* Back Button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Icon name="arrow-back" size={22} color={theme.colors.white} />
          </TouchableOpacity>

          {/* Image Counter */}
          {images.length > 1 && (
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>{activeImageIndex + 1}/{images.length}</Text>
            </View>
          )}

          {/* Pagination Dots */}
          {images.length > 1 && (
            <View style={styles.dotsRow}>
              {images.map((_: string, index: number) => (
                <View
                  key={index}
                  style={[styles.dot, activeImageIndex === index && styles.dotActive]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Title Row */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{ground.name}</Text>
            <View style={styles.titleActions}>
              <TouchableOpacity
                style={[
                  styles.favoriteButton,
                  ground.is_favorited && styles.favoriteButtonActive,
                  favoriteLoading && styles.iconButtonDisabled,
                ]}
                onPress={handleFavoriteToggle}
                activeOpacity={0.85}
                disabled={favoriteLoading}>
                <Icon
                  name={ground.is_favorited ? 'heart' : 'heart-outline'}
                  size={20}
                  color={ground.is_favorited ? theme.colors.white : theme.colors.primaryDark}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() =>
                  openCoordinatesInGoogleMaps({
                    latitude: ground.latitude,
                    longitude: ground.longitude,
                    label: ground.name,
                  })
                }
                activeOpacity={0.85}>
                <Icon name="navigate-outline" size={20} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <Icon name="location" size={16} color={theme.colors.primary} />
            <Text style={styles.location}>{ground.address}, {ground.city}, {ground.state}</Text>
          </View>

          {/* Tags */}
          <View style={styles.tags}>
            <View style={styles.tag}><Text style={styles.tagText}>{ground.ground_type}</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>⭐ {ground.avg_rating || 'New'}</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>{ground.max_players || 'Flexible'} players</Text></View>
            {ground.verification_status === 'approved' && (
              <View style={[styles.tag, styles.verifiedTag]}>
                <Text style={styles.verifiedTagText}>✓ Verified</Text>
              </View>
            )}
          </View>

          {/* About */}
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{ground.description || 'No description available for this turf.'}</Text>

          {/* Details */}
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailCard}>
            <DetailItem icon="time-outline" label="Hours" value={`${ground.opening_time || '06:00'} - ${ground.closing_time || '22:00'}`} />
            <DetailItem icon="albums-outline" label="Surface" value={ground.surface_type_display || ground.surface_type || 'Standard'} />
            <DetailItem icon="football-outline" label="Bookings" value={`${ground.total_bookings || 0} completed`} />
          </View>

          {activePricingPlans.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Pricing</Text>
              <View style={styles.pricingCard}>
                <Text style={styles.pricingIntro}>
                  These are the live rates configured by the ground owner.
                </Text>
                {activePricingPlans.map((plan: any) => (
                  <View key={plan.id} style={styles.pricingRow}>
                    <View style={styles.pricingCopy}>
                      <Text style={styles.pricingDuration}>{plan.duration_display}</Text>
                      <Text style={styles.pricingMeta}>
                        Weekday {getDisplayAmount(plan.price)}
                        {plan.weekend_price ? `  •  Weekend ${getDisplayAmount(plan.weekend_price)}` : ''}
                      </Text>
                    </View>
                    <Text style={styles.pricingValue}>{getDisplayAmount(plan.price)}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {/* Amenities */}
          {amenities.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {amenities.map((amenity: any, index: number) => {
                  const name = amenity.name || amenity;
                  const nameKey = (typeof name === 'string' ? name : '').toLowerCase().replace(/\s+/g, '_');
                  const iconName = AMENITY_ICONS[nameKey] || 'checkmark-circle-outline';
                  return (
                    <View key={index} style={styles.amenityChip}>
                      <Icon name={iconName} size={16} color={theme.colors.primary} />
                      <Text style={styles.amenityText}>
                        {typeof name === 'string' ? name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ') : name}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {/* Rules */}
          {ground.rules ? (
            <>
              <Text style={styles.sectionTitle}>Rules</Text>
              <Text style={styles.description}>{ground.rules}</Text>
            </>
          ) : null}

          {/* Reviews Section */}
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {reviews.length > 0 && (
              <Text style={styles.reviewCount}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</Text>
            )}
          </View>

          {reviews.length > 0 ? (
            <View style={styles.reviewsList}>
              {reviews.slice(0, 5).map((review: any) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewTop}>
                    <View style={styles.reviewerInfo}>
                      <View style={styles.reviewerAvatar}>
                        <Text style={styles.reviewerInitial}>
                          {(review.customer_name || review.user_name || 'U')[0].toUpperCase()}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.reviewerName}>
                          {review.customer_name || review.user_name || 'Anonymous'}
                        </Text>
                        <Text style={styles.reviewDate}>
                          {review.created_at
                            ? new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : ''}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Icon
                          key={star}
                          name={star <= (review.rating || 0) ? 'star' : 'star-outline'}
                          size={14}
                          color={star <= (review.rating || 0) ? theme.colors.accent : theme.colors.textSoft}
                        />
                      ))}
                    </View>
                  </View>
                  {review.comment ? (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  ) : null}
                  {review.reply ? (
                    <View style={styles.replyBox}>
                      <Text style={styles.replyLabel}>Owner reply:</Text>
                      <Text style={styles.replyText}>{review.reply}</Text>
                    </View>
                  ) : null}
                </View>
              ))}
              {reviews.length > 5 && (
                <Text style={styles.moreReviews}>
                  +{reviews.length - 5} more review{reviews.length - 5 !== 1 ? 's' : ''}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.noReviews}>
              <Icon name="chatbubble-outline" size={24} color={theme.colors.textSoft} />
              <Text style={styles.noReviewsText}>No reviews yet. Be the first to share your experience!</Text>
            </View>
          )}

          {/* Spacer for sticky booking card */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Sticky Booking CTA */}
      <View style={styles.bookingCard}>
        <View>
          <Text style={styles.priceLabel}>Starting at</Text>
          <Text style={styles.priceValue}>{priceHeadline.amount}</Text>
          <Text style={styles.priceSubtext}>{priceHeadline.duration}</Text>
        </View>
        <Button
          title="Book Now"
          icon={<Icon name="calendar-outline" size={18} color={theme.colors.white} />}
          onPress={() => navigation.navigate('SelectSlot', { groundId: ground.id })}
        />
      </View>
    </ScreenContainer>
  );
}

const DetailItem = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={styles.detailItem}>
    <Icon name={icon} size={18} color={theme.colors.primary} />
    <View style={styles.detailTextWrap}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 0,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: SCREEN_WIDTH,
    height: 280,
    backgroundColor: theme.colors.backgroundAlt,
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCounter: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.pill,
  },
  imageCounterText: {
    ...theme.typography.caption,
    color: theme.colors.white,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 3,
  },
  dotActive: {
    width: 22,
    backgroundColor: theme.colors.white,
  },
  content: {
    padding: theme.spacing.m,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  titleActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textMain,
    flex: 1,
    marginRight: theme.spacing.m,
  },
  favoriteButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.s,
    ...theme.shadows.soft,
  },
  favoriteButtonActive: {
    backgroundColor: theme.colors.error,
  },
  mapButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.soft,
  },
  iconButtonDisabled: {
    opacity: 0.6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  location: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    marginLeft: 6,
    flex: 1,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.l,
    gap: theme.spacing.s,
  },
  tag: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.m,
  },
  tagText: {
    color: theme.colors.primaryDark,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  verifiedTag: {
    backgroundColor: '#D4F5EC',
  },
  verifiedTagText: {
    color: '#00B894',
    fontWeight: '700',
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.textMain,
    marginBottom: theme.spacing.s,
    marginTop: theme.spacing.s,
  },
  description: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    lineHeight: 24,
  },
  detailCard: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    ...theme.shadows.soft,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  detailTextWrap: {
    marginLeft: theme.spacing.m,
    flex: 1,
  },
  detailLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSoft,
  },
  detailValue: {
    ...theme.typography.bodyM,
    color: theme.colors.textMain,
    marginTop: 2,
  },
  pricingCard: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    ...theme.shadows.soft,
  },
  pricingIntro: {
    ...theme.typography.bodyS,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.m,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  pricingCopy: {
    flex: 1,
    marginRight: theme.spacing.m,
  },
  pricingDuration: {
    ...theme.typography.bodyM,
    color: theme.colors.textMain,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  pricingMeta: {
    ...theme.typography.bodyS,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  pricingValue: {
    ...theme.typography.bodyM,
    color: theme.colors.primaryDark,
    fontWeight: '800',
  },
  // Amenities
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s,
    marginBottom: theme.spacing.m,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  amenityText: {
    ...theme.typography.bodyS,
    color: theme.colors.textMain,
    marginLeft: 8,
  },
  // Reviews
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewCount: {
    ...theme.typography.bodyS,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.s,
  },
  reviewsList: {},
  reviewCard: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    ...theme.shadows.soft,
  },
  reviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.s,
  },
  reviewerInitial: {
    ...theme.typography.bodyM,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  reviewerName: {
    ...theme.typography.bodyS,
    color: theme.colors.textMain,
    fontWeight: '600',
  },
  reviewDate: {
    ...theme.typography.caption,
    color: theme.colors.textSoft,
    marginTop: 1,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    lineHeight: 22,
  },
  replyBox: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginTop: theme.spacing.s,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  replyLabel: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  replyText: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
  },
  noReviews: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  noReviewsText: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.s,
  },
  moreReviews: {
    ...theme.typography.bodyS,
    color: theme.colors.primary,
    textAlign: 'center',
    paddingVertical: theme.spacing.s,
  },
  // Sticky Booking CTA
  bookingCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surfaceDark,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.strong,
  },
  priceLabel: {
    ...theme.typography.caption,
    color: '#B3C7DC',
  },
  priceValue: {
    ...theme.typography.h2,
    color: theme.colors.white,
  },
  priceSubtext: {
    ...theme.typography.bodyS,
    color: '#9CCAFF',
    marginTop: 2,
    textTransform: 'capitalize',
  },
});
