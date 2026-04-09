import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { theme } from '../../utils/theme';
import { groundsAPI } from '../../api/grounds';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getErrorMessage } from '../../utils/error';
import { openCoordinatesInGoogleMaps } from '../../utils/map';

export default function GroundDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const groundId = route.params?.groundId;

  const [ground, setGround] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchGroundDetail();
  }, [groundId]);

  // Refresh when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchGroundDetail();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchGroundDetail = async () => {
    try {
      setLoading(true);
      const res = await groundsAPI.detail(groundId);
      setGround(res.data);
    } catch (error) {
      Alert.alert('Unable to load ground', getErrorMessage(error, 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Ground',
      'Are you sure you want to delete this ground? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await groundsAPI.delete(groundId);
      Alert.alert('Success', 'Ground deleted successfully', [
        { 
          text: 'OK', 
          onPress: () => {
            navigation.navigate('MyGroundsList');
          }
        },
      ]);
    } catch (error: any) {
      Alert.alert('Delete failed', getErrorMessage(error, 'Failed to delete ground.'));
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditGround', { 
      groundId, 
      ground,
      onUpdate: () => fetchGroundDetail() // Refresh after edit
    });
  };

  const handleManageSlots = () => {
    navigation.navigate('ManageSlots', {
      groundId,
      ground,
    });
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!ground) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Ground not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Images */}
        {ground.images && ground.images.length > 0 ? (
          <ScrollView horizontal pagingEnabled style={styles.imageCarousel}>
            {ground.images.map((img: any) => (
              <Image
                key={img.id}
                source={{ uri: img.image }}
                style={styles.image}
                resizeMode="cover"
                onError={(e) => console.log('[DetailScreen] Image load error:', img.image, e.nativeEvent.error)}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageText}>No images uploaded</Text>
          </View>
        )}

        {/* Basic Info */}
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={styles.name}>{ground.name}</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.mapAction}
                onPress={() =>
                  openCoordinatesInGoogleMaps({
                    latitude: ground.latitude,
                    longitude: ground.longitude,
                    label: ground.name,
                  })
                }
                activeOpacity={0.85}>
                <Icon name="map-outline" size={18} color={theme.colors.white} />
              </TouchableOpacity>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {ground.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </View>
          
          {ground.is_verified && (
            <View style={styles.verifiedBadge}>
              <Icon name="checkmark-circle" size={16} color={theme.colors.success} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}

          <Text style={styles.description}>{ground.description}</Text>

          <View style={styles.infoRow}>
            <Icon name="location-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.infoText}>
              {ground.address}, {ground.city}, {ground.state} - {ground.pincode}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="star" size={20} color={theme.colors.warning} />
              <Text style={styles.statText}>{ground.avg_rating || '0.0'}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="calendar-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.statText}>{ground.total_bookings || 0} bookings</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="chatbubble-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.statText}>{ground.total_reviews || 0} reviews</Text>
            </View>
          </View>
        </View>

        {/* Ground Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ground Details</Text>
          <DetailRow label="Type" value={ground.ground_type_display} />
          <DetailRow label="Surface" value={ground.surface_type_display} />
          <DetailRow label="Max Players" value={ground.max_players?.toString()} />
          <DetailRow
            label="Timings"
            value={`${ground.opening_time} - ${ground.closing_time}`}
          />
        </View>

        {/* Amenities */}
        {ground.amenities && ground.amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesContainer}>
              {ground.amenities.map((amenity: any) => (
                <View key={amenity.id} style={styles.amenityChip}>
                  <Text style={styles.amenityText}>{amenity.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Pricing Plans */}
        {ground.pricing_plans && ground.pricing_plans.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing Plans</Text>
            {ground.pricing_plans.map((plan: any) => (
              <View key={plan.id} style={styles.pricingCard}>
                <Text style={styles.pricingDuration}>{plan.duration_display}</Text>
                <Text style={styles.pricingAmount}>₹{plan.price}</Text>
                {plan.weekend_price && (
                  <Text style={styles.pricingWeekend}>
                    Weekend: ₹{plan.weekend_price}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Rules & Policies */}
        {ground.rules && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rules</Text>
            <Text style={styles.bodyText}>{ground.rules}</Text>
          </View>
        )}

        {ground.cancellation_policy && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cancellation Policy</Text>
            <Text style={styles.bodyText}>{ground.cancellation_policy}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Manage Slots"
            onPress={handleManageSlots}
            variant="outline"
            style={styles.manageBtn}
          />
          <Button
            title="Edit Ground"
            onPress={handleEdit}
            style={styles.editBtn}
          />
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDelete}
            disabled={deleting}
          >
            <Icon name="trash-outline" size={20} color={theme.colors.white} />
            <Text style={styles.deleteBtnText}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const DetailRow = ({ label, value }: { label: string; value?: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value || 'N/A'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingBottom: theme.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...theme.typography.bodyL,
    color: theme.colors.textMuted,
  },
  imageCarousel: {
    height: 250,
  },
  image: {
    width: theme.spacing.screenWidth,
    height: 250,
  },
  noImageContainer: {
    height: 250,
    backgroundColor: theme.colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
  },
  section: {
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  headerActions: {
    alignItems: 'flex-end',
  },
  name: {
    ...theme.typography.h2,
    color: theme.colors.textMain,
    flex: 1,
  },
  mapAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.s,
    ...theme.shadows.soft,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.success + '20',
  },
  statusText: {
    ...theme.typography.caption,
    color: theme.colors.success,
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  verifiedText: {
    ...theme.typography.caption,
    color: theme.colors.success,
    marginLeft: 4,
    fontWeight: '500',
  },
  description: {
    ...theme.typography.bodyM,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.m,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.m,
  },
  infoText: {
    ...theme.typography.bodyS,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.s,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...theme.typography.bodyS,
    color: theme.colors.textMain,
    marginLeft: 4,
    fontWeight: '500',
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
    marginBottom: theme.spacing.m,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.s,
  },
  detailLabel: {
    ...theme.typography.bodyM,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    ...theme.typography.bodyM,
    color: theme.colors.textMain,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.primaryLight + '30',
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  amenityText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  pricingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.m,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.s,
  },
  pricingDuration: {
    ...theme.typography.bodyM,
    color: theme.colors.textMain,
    fontWeight: '500',
  },
  pricingAmount: {
    ...theme.typography.h3,
    color: theme.colors.primary,
  },
  pricingWeekend: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  bodyText: {
    ...theme.typography.bodyM,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  actionButtons: {
    padding: theme.spacing.m,
  },
  manageBtn: {
    marginBottom: theme.spacing.m,
  },
  editBtn: {
    marginBottom: theme.spacing.m,
  },
  deleteBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.m,
    paddingVertical: theme.spacing.m,
  },
  deleteBtnText: {
    ...theme.typography.bodyM,
    color: theme.colors.white,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
});
